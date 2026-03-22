# Rustlings — зависимости Replit (Nix)
# rustc нужен для компиляции решений пользователей в /api/check_solution

{ pkgs }: {
  deps = [
    pkgs.rustc
    pkgs.cargo
    pkgs.pkg-config
  ];
}
