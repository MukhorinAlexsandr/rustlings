use axum::{
    extract::Json as JsonExtract,
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::net::SocketAddr;
use std::path::PathBuf;
use std::sync::Arc;
use tokio::process::Command;
use tower_http::services::ServeDir;

#[derive(Serialize)]
struct HelloResponse {
    message: String,
}

async fn hello_handler() -> Json<HelloResponse> {
    Json(HelloResponse {
        message: String::from("Привет с бэкенда!"),
    })
}

#[derive(Deserialize)]
struct CheckRequest {
    code: String,
    #[serde(rename = "taskId")]
    task_id: String,
}

#[derive(Serialize)]
struct CheckResponse {
    ok: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    error: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    output: Option<String>,
}

#[derive(Deserialize, Clone)]
struct PracticeTask {
    id: String,
    #[serde(rename = "testCode")]
    test_code: String,
    #[allow(dead_code)]
    template: Option<String>,
}

type TaskMap = HashMap<String, PracticeTask>;

fn load_all_tasks() -> TaskMap {
    let mut map = HashMap::new();
    let tasks_dir = PathBuf::from("static/data/tasks");

    if !tasks_dir.exists() {
        eprintln!("Warning: tasks directory not found at {:?}", tasks_dir);
        return map;
    }

    for entry in std::fs::read_dir(&tasks_dir).unwrap_or_else(|_| {
        panic!("Cannot read tasks directory: {:?}", tasks_dir);
    }) {
        let entry = match entry {
            Ok(e) => e,
            Err(_) => continue,
        };
        let path = entry.path();
        if path.extension().map_or(true, |ext| ext != "json") {
            continue;
        }

        let content = match std::fs::read_to_string(&path) {
            Ok(c) => c,
            Err(e) => {
                eprintln!("Error reading {:?}: {}", path, e);
                continue;
            }
        };

        let tasks: Vec<PracticeTask> = match serde_json::from_str(&content) {
            Ok(t) => t,
            Err(e) => {
                eprintln!("Error parsing {:?}: {}", path, e);
                continue;
            }
        };

        for task in tasks {
            map.insert(task.id.clone(), task);
        }
    }

    println!("Loaded {} practice tasks", map.len());
    map
}

async fn check_solution(
    tasks: Arc<TaskMap>,
    JsonExtract(req): JsonExtract<CheckRequest>,
) -> Json<CheckResponse> {
    let task = match tasks.get(&req.task_id) {
        Some(t) => t,
        None => {
            return Json(CheckResponse {
                ok: false,
                error: Some(format!("Task '{}' not found", req.task_id)),
                output: None,
            });
        }
    };

    let full_code = format!("{}\n\n{}", req.code.trim(), task.test_code);

    let tmp_dir = match tempfile::tempdir() {
        Ok(d) => d,
        Err(e) => {
            return Json(CheckResponse {
                ok: false,
                error: Some(format!("Server error: {}", e)),
                output: None,
            });
        }
    };

    let src_path = tmp_dir.path().join("solution.rs");
    let exe_name = format!("solution{}", std::env::consts::EXE_SUFFIX);
    let exe_path = tmp_dir.path().join(&exe_name);

    if let Err(e) = std::fs::write(&src_path, &full_code) {
        return Json(CheckResponse {
            ok: false,
            error: Some(format!("Server error: {}", e)),
            output: None,
        });
    }

    let compile_result = Command::new("rustc")
        .arg(&src_path)
        .arg("-o")
        .arg(&exe_path)
        .arg("--edition")
        .arg("2021")
        .output()
        .await;

    let compile_output = match compile_result {
        Ok(o) => o,
        Err(e) => {
            return Json(CheckResponse {
                ok: false,
                error: Some(format!("Compiler not available: {}", e)),
                output: None,
            });
        }
    };

    if !compile_output.status.success() {
        let stderr = String::from_utf8_lossy(&compile_output.stderr).to_string();
        let clean_error = clean_compiler_error(&stderr, tmp_dir.path().to_str().unwrap_or(""));
        return Json(CheckResponse {
            ok: false,
            error: Some(format!("Ошибка компиляции:\n{}", clean_error)),
            output: None,
        });
    }

    let run_result = tokio::time::timeout(
        std::time::Duration::from_secs(10),
        Command::new(&exe_path).output(),
    )
    .await;

    match run_result {
        Err(_) => Json(CheckResponse {
            ok: false,
            error: Some("Превышено время выполнения (10 секунд). Возможно, бесконечный цикл?".into()),
            output: None,
        }),
        Ok(Err(e)) => Json(CheckResponse {
            ok: false,
            error: Some(format!("Ошибка запуска: {}", e)),
            output: None,
        }),
        Ok(Ok(run_output)) => {
            let stdout = String::from_utf8_lossy(&run_output.stdout).to_string();
            let stderr = String::from_utf8_lossy(&run_output.stderr).to_string();
            let tmp_str = tmp_dir.path().to_str().unwrap_or("");

            if run_output.status.success() && stdout.contains("OK") {
                Json(CheckResponse {
                    ok: true,
                    error: None,
                    output: Some(stdout.trim().to_string()),
                })
            } else {
                let clean_stderr = clean_runtime_error(&stderr, tmp_str);
                let error_msg = if !clean_stderr.is_empty() {
                    clean_stderr
                } else if !stdout.is_empty() {
                    stdout.trim().to_string()
                } else {
                    "Программа завершилась с ошибкой".into()
                };

                Json(CheckResponse {
                    ok: false,
                    error: Some(error_msg),
                    output: None,
                })
            }
        }
    }
}

fn clean_runtime_error(stderr: &str, tmp_path: &str) -> String {
    let cleaned = stderr
        .replace(tmp_path, "")
        .replace("\\solution.rs", "solution.rs")
        .replace("/solution.rs", "solution.rs");

    cleaned
        .lines()
        .filter(|line| {
            let t = line.trim();
            !t.is_empty() && !t.starts_with("note: run with")
        })
        .take(10)
        .collect::<Vec<_>>()
        .join("\n")
}

fn clean_compiler_error(stderr: &str, tmp_path: &str) -> String {
    stderr
        .replace(tmp_path, "")
        .replace("\\solution.rs", "solution.rs")
        .replace("/solution.rs", "solution.rs")
        .lines()
        .filter(|line| {
            let trimmed = line.trim();
            !trimmed.is_empty() && trimmed.is_ascii()
        })
        .take(20)
        .collect::<Vec<_>>()
        .join("\n")
}

#[tokio::main]
async fn main() {
    let tasks = Arc::new(load_all_tasks());
    let tasks_for_handler = tasks.clone();

    let app = Router::new()
        .route("/api/hello", get(hello_handler))
        .route(
            "/api/check_solution",
            post(move |body| check_solution(tasks_for_handler.clone(), body)),
        )
        .nest_service("/", ServeDir::new("static"));

    let port: u16 = std::env::var("PORT")
        .ok()
        .and_then(|p| p.parse().ok())
        .unwrap_or(3000);
    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    println!("Сервер запущен: http://0.0.0.0:{}", port);

    axum::serve(
        tokio::net::TcpListener::bind(addr).await.unwrap(),
        app,
    )
    .await
    .unwrap();
}
