from __future__ import annotations

import argparse
import json
import os
from collections import Counter
from pathlib import Path
from typing import Any


DEFAULT_IGNORES = {
    ".git",
    ".next",
    ".turbo",
    ".cache",
    ".idea",
    ".vscode",
    ".pnpm-store",
    ".yarn",
    ".venv",
    "venv",
    "__pycache__",
    "node_modules",
    "coverage",
    "dist",
    "build",
    "out",
    "tmp",
    "temp",
}


IMPORTANT_FILES = {
    "package.json",
    "pnpm-workspace.yaml",
    "pnpm-lock.yaml",
    "turbo.json",
    "tsconfig.json",
    "tsconfig.base.json",
    "next.config.js",
    "next.config.mjs",
    "next.config.ts",
    "vite.config.js",
    "vite.config.ts",
    "eslint.config.js",
    "eslint.config.mjs",
    "prettier.config.js",
    "docker-compose.yml",
    "docker-compose.yaml",
    "Dockerfile",
    ".env.example",
    ".gitignore",
    "README.md",
}


def human_size(size: int) -> str:
    units = ["B", "KB", "MB", "GB"]
    value = float(size)

    for unit in units:
        if value < 1024:
            return f"{value:.1f} {unit}"
        value /= 1024

    return f"{value:.1f} TB"


def is_ignored(path: Path, root: Path, ignores: set[str]) -> bool:
    try:
        relative = path.relative_to(root)
    except ValueError:
        return True

    return any(part in ignores for part in relative.parts)


def get_directory_tree(
    root: Path,
    ignores: set[str],
    max_depth: int | None,
) -> list[str]:
    lines: list[str] = [f"{root.name}/"]

    def walk(directory: Path, prefix: str, depth: int) -> None:
        if max_depth is not None and depth >= max_depth:
            return

        try:
            entries = [
                item
                for item in directory.iterdir()
                if not is_ignored(item, root, ignores)
            ]
        except PermissionError:
            return

        entries.sort(key=lambda p: (p.is_file(), p.name.lower()))

        for index, entry in enumerate(entries):
            is_last = index == len(entries) - 1

            branch = "└── " if is_last else "├── "
            lines.append(f"{prefix}{branch}{entry.name}{'/' if entry.is_dir() else ''}")

            if entry.is_dir():
                extension = "    " if is_last else "│   "
                walk(entry, prefix + extension, depth + 1)

    walk(root, "", 0)

    return lines


def scan_files(root: Path, ignores: set[str]) -> list[dict[str, Any]]:
    files: list[dict[str, Any]] = []

    for current_root, dirs, filenames in os.walk(root):
        current = Path(current_root)

        dirs[:] = [
            directory
            for directory in dirs
            if directory not in ignores
            and not is_ignored(current / directory, root, ignores)
        ]

        for filename in filenames:
            path = current / filename

            if is_ignored(path, root, ignores):
                continue

            try:
                stat = path.stat()
            except OSError:
                continue

            files.append(
                {
                    "path": path.relative_to(root).as_posix(),
                    "name": filename,
                    "extension": path.suffix.lower() or "(none)",
                    "size": stat.st_size,
                }
            )

    return files


def discover_packages(root: Path, ignores: set[str]) -> list[dict[str, Any]]:
    packages: list[dict[str, Any]] = []

    for package_file in root.rglob("package.json"):
        if is_ignored(package_file, root, ignores):
            continue

        try:
            data = json.loads(package_file.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError, OSError):
            continue

        package_dir = package_file.parent

        dependencies = {
            "dependencies": data.get("dependencies", {}),
            "devDependencies": data.get("devDependencies", {}),
            "peerDependencies": data.get("peerDependencies", {}),
            "optionalDependencies": data.get("optionalDependencies", {}),
        }

        packages.append(
            {
                "path": (
                    "."
                    if package_dir == root
                    else package_dir.relative_to(root).as_posix()
                ),
                "name": data.get("name"),
                "version": data.get("version"),
                "private": data.get("private", False),
                "scripts": data.get("scripts", {}),
                **dependencies,
            }
        )

    packages.sort(key=lambda item: item["path"])

    return packages


def find_important_files(
    root: Path,
    ignores: set[str],
) -> list[str]:
    result: list[str] = []

    for path in root.rglob("*"):
        if not path.is_file():
            continue

        if is_ignored(path, root, ignores):
            continue

        if path.name in IMPORTANT_FILES:
            result.append(path.relative_to(root).as_posix())

    return sorted(result)


def find_workspace_dependencies(
    packages: list[dict[str, Any]],
) -> list[dict[str, str]]:
    package_names = {
        package["name"]: package
        for package in packages
        if package.get("name")
    }

    relations: list[dict[str, str]] = []

    sections = (
        "dependencies",
        "devDependencies",
        "peerDependencies",
        "optionalDependencies",
    )

    for package in packages:
        source = package.get("name")

        if not source:
            continue

        for section in sections:
            for dependency, version in package.get(section, {}).items():
                if dependency not in package_names:
                    continue

                relations.append(
                    {
                        "from": source,
                        "to": dependency,
                        "type": section,
                        "version": version,
                    }
                )

    return relations


def build_report(
    root: Path,
    files: list[dict[str, Any]],
    packages: list[dict[str, Any]],
    workspace_dependencies: list[dict[str, str]],
    important_files: list[str],
    tree: list[str],
) -> str:
    total_size = sum(file["size"] for file in files)

    extension_counter = Counter(
        file["extension"] for file in files
    )

    directory_counter: Counter[str] = Counter()

    for file in files:
        parts = Path(file["path"]).parts

        if len(parts) > 1:
            directory_counter[parts[0]] += 1
        else:
            directory_counter["(root)"] += 1

    lines: list[str] = []

    lines.append("# Project Map")
    lines.append("")
    lines.append(f"**Root:** `{root}`")
    lines.append("")
    lines.append(f"- Files: **{len(files):,}**")
    lines.append(f"- Size: **{human_size(total_size)}**")
    lines.append(f"- Packages: **{len(packages)}**")
    lines.append("")

    lines.append("## Workspace Packages")
    lines.append("")

    if not packages:
        lines.append("_No package.json files found._")
    else:
        for package in packages:
            name = package.get("name") or "(unnamed)"
            path = package["path"]

            lines.append(f"### `{name}`")
            lines.append("")
            lines.append(f"- Path: `{path}`")

            scripts = package.get("scripts", {})

            if scripts:
                lines.append("- Scripts:")

                for script_name, command in scripts.items():
                    lines.append(
                        f"  - `{script_name}` → `{command}`"
                    )

            lines.append("")

    lines.append("## Internal Workspace Dependencies")
    lines.append("")

    if workspace_dependencies:
        for relation in workspace_dependencies:
            lines.append(
                f"- `{relation['from']}` → "
                f"`{relation['to']}` "
                f"({relation['type']}: `{relation['version']}`)"
            )
    else:
        lines.append("_No internal workspace dependencies detected._")

    lines.append("")

    lines.append("## Important Configuration Files")
    lines.append("")

    for path in important_files:
        lines.append(f"- `{path}`")

    lines.append("")

    lines.append("## File Types")
    lines.append("")
    lines.append("| Extension | Files |")
    lines.append("|---|---:|")

    for extension, count in extension_counter.most_common():
        lines.append(f"| `{extension}` | {count} |")

    lines.append("")

    lines.append("## Top-Level Distribution")
    lines.append("")
    lines.append("| Directory | Files |")
    lines.append("|---|---:|")

    for directory, count in directory_counter.most_common():
        lines.append(f"| `{directory}` | {count} |")

    lines.append("")

    lines.append("## Project Tree")
    lines.append("")
    lines.append("```text")
    lines.extend(tree)
    lines.append("```")
    lines.append("")

    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Generate a structural map of a project/monorepo."
    )

    parser.add_argument(
        "root",
        nargs="?",
        default=".",
        help="Project root (default: current directory)",
    )

    parser.add_argument(
        "--max-depth",
        type=int,
        default=None,
        help="Maximum tree depth",
    )

    parser.add_argument(
        "--ignore",
        action="append",
        default=[],
        help="Additional directory to ignore",
    )

    parser.add_argument(
        "--output",
        default="PROJECT_MAP.md",
        help="Markdown output filename",
    )

    parser.add_argument(
        "--json-output",
        default="PROJECT_MAP.json",
        help="JSON output filename",
    )

    args = parser.parse_args()

    root = Path(args.root).resolve()

    if not root.exists():
        raise SystemExit(f"Project root does not exist: {root}")

    ignores = DEFAULT_IGNORES | set(args.ignore)

    print(f"Mapping project: {root}")

    files = scan_files(root, ignores)
    packages = discover_packages(root, ignores)
    important_files = find_important_files(root, ignores)
    workspace_dependencies = find_workspace_dependencies(packages)

    tree = get_directory_tree(
        root,
        ignores,
        args.max_depth,
    )

    report = build_report(
        root=root,
        files=files,
        packages=packages,
        workspace_dependencies=workspace_dependencies,
        important_files=important_files,
        tree=tree,
    )

    markdown_path = root / args.output
    json_path = root / args.json_output

    markdown_path.write_text(
        report,
        encoding="utf-8",
    )

    json_data = {
        "root": str(root),
        "statistics": {
            "files": len(files),
            "totalSize": sum(file["size"] for file in files),
        },
        "packages": packages,
        "workspaceDependencies": workspace_dependencies,
        "importantFiles": important_files,
        "files": files,
    }

    json_path.write_text(
        json.dumps(
            json_data,
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    print()
    print("Project map generated:")
    print(f"  {markdown_path}")
    print(f"  {json_path}")


if __name__ == "__main__":
    main()