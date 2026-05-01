#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <module-slug>"
  echo "Example: $0 orders"
  exit 1
fi

module="$1"
root="$(pwd)"

echo "Checking module: $module"

route_hits=$(find "$root/routes/modules" -maxdepth 1 -type f -name "*Routes.php" -print0 | xargs -0 rg -n "${module}|${module%s}" -S || true)
controller_hits=$(find "$root/app/Http/Controllers" -maxdepth 1 -type f -print0 | xargs -0 rg -n "${module}|${module%s}" -S || true)
page_hits=$(find "$root/resources/js/Pages" -type f -print0 | xargs -0 rg -n "${module}|${module%s}" -S || true)

echo "\nRoute matches:"
echo "${route_hits:-none}"

echo "\nController matches:"
echo "${controller_hits:-none}"

echo "\nPage matches:"
echo "${page_hits:-none}"

if [[ -z "$route_hits" ]]; then
  echo "\nWarning: no module route match found for '$module'."
fi
