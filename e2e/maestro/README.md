# Maestro E2E Tests — Show Studio

Mobile UI verification flows using [Maestro](https://docs.maestro.com) (v2.11.0).

These flows test the **Nike Virtual Store** rebuild (`show-studio`) against the original `virtualstore.bildyard.com` reference, with focus on **mobile 1:1 fidelity**.

## Prerequisites

- Java 17+ (`java -version`, `JAVA_HOME` set)
- Maestro CLI installed: `maestro --version`

## Quick Start

```bash
# Run all flows against the live staging site
pnpm test:maestro

# Run a single flow
maestro test e2e/maestro/flows/nav-order.yaml \
  --web-url https://show-studio-seven.vercel.app

# Run against localhost dev server
pnpm dev &
maestro test e2e/maestro/flows \
  --web-url http://localhost:5173
```

## Flow Catalog

| Flow | File | Tags | Verifies |
|------|------|------|----------|
| Home / Overview | `home-overview.yaml` | smoke, overview | Brand wordmark, cart icon, nav order, header buttons |
| Nav Order | `nav-order.yaml` | smoke | Store→Clothing→Caps→Bags→Shoes→i order |
| Overview Camera | `overview-camera.yaml` | overview, camera | 3D canvas, wall lettering, floor visibility |
| Clothing Dept | `clothing-department.yaml` | clothing, department | Rail, garments, section navigation |
| Shoes Dept | `shoes-department.yaml` | shoes, department | 3×3 shelf grid, navigation |
| Caps Dept | `caps-department.yaml` | caps, department | 2×4 pegboard, navigation |
| Bags Dept | `bags-department.yaml` | bags, department | Cubby unit, crossbody hooks, navigation |
| Product Modal | `product-modal.yaml` | product, modal | 360° turn stage, thumbnails, size picker, cart |
| Touch Momentum | `touch-momentum.yaml` | touch, momentum, snap | Drag→momentum→spring snap-back |

## Original vs. Rebuilt Differences

Reference images in `docs/original-reference/`:

- **Nav order**: Original = Store/Clothing/Caps/Bags/Shoes; Fixed in commit `98b4a5d`
- **Camera**: Original eye-level, slightly off-center into corner; rebuild matches overview positioning
- **Caps department**: Original has 2×4 birch pegboard pattern with specific cap arrangement

## CI Integration

Add to `.github/workflows/maestro.yml`:

```yaml
- name: Install Maestro
  run: |
    base=https://github.com/mobile-dev-inc/maestro/releases/download/cli-2.11.0
    curl -fsSLO $base/maestro.zip
    curl -fsSL $base/checksums_sha256.txt | sha256sum -c -
    unzip -q maestro.zip -d "$HOME/.maestro-cli"
    echo "$HOME/.maestro-cli/maestro/bin" >> $GITHUB_PATH

- name: E2E Tests
  run: |
    maestro test e2e/maestro/flows --web-url https://show-studio-seven.vercel.app
```