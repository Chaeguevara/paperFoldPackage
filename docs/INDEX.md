# Paper Fold Package Documentation Index

## 🚀 Getting Started

**New to this project?** Start here:

1. **[QUICK_START.md](QUICK_START.md)** - 5-minute overview
2. **[COMPLETE_SUMMARY.md](COMPLETE_SUMMARY.md)** - Full feature summary
3. **Run tests**: `npm install && npm run test:behavior`

---

## 📚 Documentation Map

### User Guides

| Document | What It Covers | When to Read |
|----------|----------------|--------------|
| **[QUICK_START.md](QUICK_START.md)** | Overview, key features, usage | First time setup |
| **[CYLINDER_FIX.md](CYLINDER_FIX.md)** | ✨ Cylinder now generates true cylinder (not hexagon) | Understanding cylinder pattern |
| **[PARAMETER_VALIDATION_GUIDE.md](PARAMETER_VALIDATION_GUIDE.md)** | Testing parameter behavior | When sliders seem broken |
| **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** | Complete implementation details | Understanding how it works |
| **[COMPLETE_SUMMARY.md](COMPLETE_SUMMARY.md)** | Everything built in this session | Reference for all features |

### Technical Documentation

| Document | What It Covers | When to Read |
|----------|----------------|--------------|
| **[PARAMETER_BEHAVIOR.md](PARAMETER_BEHAVIOR.md)** | Why some parameters don't work | Debugging UI issues |
| **[theorems/README.md](theorems/README.md)** | Theorem system overview | Understanding validation |
| **[theorems/ARCHITECTURE.md](theorems/ARCHITECTURE.md)** | System architecture diagrams | Deep dive into code structure |

---

## 🔬 Theorem Documentation

### Core Theorems (Basic → Advanced)

| Theorem | Category | Status | Read This For... |
|---------|----------|--------|------------------|
| **[Kawasaki-Justin](theorems/kawasaki-justin.md)** | Flat-foldability | ✅ Implemented | Angle constraints at vertices |
| **[Maekawa](theorems/maekawa.md)** | Flat-foldability | 📝 Documented | Mountain-valley fold balance |
| **[Assembly Mechanics](theorems/assembly-mechanics.md)** | Engineering | ⚠️ Partial | Tab/slit design rules |
| **[Tree Theorem](theorems/tree-theorem.md)** | Advanced Design | 📝 Future | Custom base generation |

**Quick Navigation**:
- Need math background? → [Kawasaki-Justin](theorems/kawasaki-justin.md)
- Need engineering specs? → [Assembly Mechanics](theorems/assembly-mechanics.md)
- Want advanced features? → [Tree Theorem](theorems/tree-theorem.md)

---

## 🛠️ Implementation Files

### Created/Modified Code

| File | Purpose | Type |
|------|---------|------|
| `src/core/theorems.ts` | Runtime validation | ✨ New |
| `src/core/parameterValidator.ts` | Parameter behavior tests | ✨ New |
| `src/ui/ValidationPanel.tsx` | Real-time validation UI | ✨ New |
| `src/scripts/testParameterBehavior.ts` | Test automation | ✨ New |
| `src/pages/Editor.tsx` | URL params, hide selector | ✨ Modified |
| `src/pages/Templates.tsx` | Export templates array | ✨ Modified |
| `src/ui/ConfigPanel.tsx` | Conditional shape selector | ✨ Modified |

### Test Scripts

```bash
npm run test:behavior    # Test parameter behavior
npm run dev              # Start development server
npm run build            # Production build
```

---

## 🎯 Common Tasks

### I want to...

**Understand why a slider doesn't work**
→ Read [PARAMETER_BEHAVIOR.md](PARAMETER_BEHAVIOR.md)
→ Run `npm run test:behavior`

**Add validation to the UI**
→ Read [PARAMETER_VALIDATION_GUIDE.md](PARAMETER_VALIDATION_GUIDE.md)
→ See "Integration Examples"

**Understand the math behind folds**
→ Read [theorems/kawasaki-justin.md](theorems/kawasaki-justin.md)
→ Read [theorems/maekawa.md](theorems/maekawa.md)

**Learn about tab/slit design**
→ Read [theorems/assembly-mechanics.md](theorems/assembly-mechanics.md)
→ Section: "Tab Design Constraints"

**Implement advanced features (Tree Theorem)**
→ Read [theorems/tree-theorem.md](theorems/tree-theorem.md)
→ Section: "Implementation Algorithm"

**See system architecture**
→ Read [theorems/ARCHITECTURE.md](theorems/ARCHITECTURE.md)
→ Diagrams show data flow

---

## 📊 Feature Matrix

### What's Working ✅

| Feature | Status | Documentation |
|---------|--------|---------------|
| Template click → hide shape selector | ✅ | [QUICK_START.md](QUICK_START.md) |
| Kawasaki-Justin validation | ✅ | [kawasaki-justin.md](theorems/kawasaki-justin.md) |
| Parameter behavior testing | ✅ | [PARAMETER_VALIDATION_GUIDE.md](PARAMETER_VALIDATION_GUIDE.md) |
| Tab/slit generation | ✅ | [assembly-mechanics.md](theorems/assembly-mechanics.md) |
| Theorem documentation | ✅ | [theorems/README.md](theorems/README.md) |

### What's Documented 📝

| Feature | Status | Documentation |
|---------|--------|---------------|
| Maekawa validation | 📝 | [maekawa.md](theorems/maekawa.md) |
| Tree Theorem (advanced) | 📝 | [tree-theorem.md](theorems/tree-theorem.md) |
| Material thickness validation | 📝 | [assembly-mechanics.md](theorems/assembly-mechanics.md) |

### What's Planned 🔮

| Feature | Priority | Documentation |
|---------|----------|---------------|
| Hide unused parameters | High | [PARAMETER_BEHAVIOR.md](PARAMETER_BEHAVIOR.md) |
| ValidationPanel UI integration | Medium | [PARAMETER_VALIDATION_GUIDE.md](PARAMETER_VALIDATION_GUIDE.md) |
| Circle packing solver | Future | [tree-theorem.md](theorems/tree-theorem.md) |
| Custom base designer | Future | [tree-theorem.md](theorems/tree-theorem.md) |

---

## 🧩 Problem → Solution Map

### Problem: "Width slider doesn't change pyramid"

**Diagnosis**: Pyramid uses `min(width, depth)`, so larger value is ignored

**Solutions**:
1. Read [PARAMETER_BEHAVIOR.md](PARAMETER_BEHAVIOR.md) - Section: "Pyramid Issue"
2. Run `npm run test:behavior` to see detection
3. See proposed fixes in [PARAMETER_VALIDATION_GUIDE.md](PARAMETER_VALIDATION_GUIDE.md)

---

### Problem: "Pattern won't fold flat"

**Diagnosis**: May violate Kawasaki-Justin or Maekawa theorem

**Solutions**:
1. Read [kawasaki-justin.md](theorems/kawasaki-justin.md) - Section: "Validation"
2. Use `validatePattern()` from `src/core/theorems.ts`
3. Check vertex angles and mountain/valley balance

---

### Problem: "Tabs pull out during assembly"

**Diagnosis**: Tab depth or taper ratio incorrect

**Solutions**:
1. Read [assembly-mechanics.md](theorems/assembly-mechanics.md) - Section: "Tab Design"
2. Check tab depth = 12-15% of smallest dimension
3. Verify taper ratio = 0.7

---

### Problem: "Want to design custom shapes"

**Solution**: Future feature based on Tree Theorem

**Roadmap**:
1. Read [tree-theorem.md](theorems/tree-theorem.md)
2. Understand circle packing optimization
3. See implementation roadmap (Phases 1-6)

---

## 📖 Reading Order

### For Users

1. [QUICK_START.md](QUICK_START.md) - Overview
2. Run `npm run test:behavior` - See parameter issues
3. [PARAMETER_BEHAVIOR.md](PARAMETER_BEHAVIOR.md) - Understand why
4. [theorems/assembly-mechanics.md](theorems/assembly-mechanics.md) - Learn tab/slit design

### For Developers

1. [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - What was built
2. [theorems/ARCHITECTURE.md](theorems/ARCHITECTURE.md) - System design
3. [PARAMETER_VALIDATION_GUIDE.md](PARAMETER_VALIDATION_GUIDE.md) - Testing
4. Source code in `src/core/theorems.ts` and `src/core/parameterValidator.ts`

### For Mathematicians

1. [theorems/kawasaki-justin.md](theorems/kawasaki-justin.md) - Angle constraints
2. [theorems/maekawa.md](theorems/maekawa.md) - Mountain-valley balance
3. [theorems/tree-theorem.md](theorems/tree-theorem.md) - Circle packing & optimization
4. Original sources: Lang (2011), Maekawa (1989), Kawasaki (1989)

---

## 🔍 Search by Topic

### Theorems & Mathematics
- Kawasaki-Justin → [kawasaki-justin.md](theorems/kawasaki-justin.md)
- Maekawa → [maekawa.md](theorems/maekawa.md)
- Tree Theorem → [tree-theorem.md](theorems/tree-theorem.md)
- Pythagorean Stretch → [tree-theorem.md](theorems/tree-theorem.md#pythagorean-stretch)
- Rabbit-ear molecule → [tree-theorem.md](theorems/tree-theorem.md#rabbit-ear-molecule)

### Engineering & Assembly
- Tab design → [assembly-mechanics.md](theorems/assembly-mechanics.md#tab-design-constraints)
- Slit design → [assembly-mechanics.md](theorems/assembly-mechanics.md#slit-design-constraints)
- Material thickness → [assembly-mechanics.md](theorems/assembly-mechanics.md#material-thickness-constraints)
- Glue-free assembly → [assembly-mechanics.md](theorems/assembly-mechanics.md#core-principle)

### UI & UX
- Template behavior → [QUICK_START.md](QUICK_START.md#key-features)
- Parameter issues → [PARAMETER_BEHAVIOR.md](PARAMETER_BEHAVIOR.md)
- Validation panel → [PARAMETER_VALIDATION_GUIDE.md](PARAMETER_VALIDATION_GUIDE.md#integration-with-ui)

### Testing & Validation
- Parameter tests → [PARAMETER_VALIDATION_GUIDE.md](PARAMETER_VALIDATION_GUIDE.md)
- Theorem validation → [theorems/README.md](theorems/README.md#using-theorems-in-code)
- Test scripts → `npm run test:behavior`

---

## 📞 Quick Links

### Most Important Files

1. **Start here**: [QUICK_START.md](QUICK_START.md)
2. **Full summary**: [COMPLETE_SUMMARY.md](COMPLETE_SUMMARY.md)
3. **Theorem overview**: [theorems/README.md](theorems/README.md)
4. **Test guide**: [PARAMETER_VALIDATION_GUIDE.md](PARAMETER_VALIDATION_GUIDE.md)

### Code Entry Points

- **Validation**: `src/core/theorems.ts`
- **Parameter testing**: `src/core/parameterValidator.ts`
- **UI component**: `src/ui/ValidationPanel.tsx`
- **Test script**: `src/scripts/testParameterBehavior.ts`

### External Resources

- **Robert J. Lang**: "Origami Design Secrets" (2011)
- **TreeMaker**: Lang's origami design software
- **Origami Database**: Academic papers on origami mathematics

---

## 📈 Version History

- **v1.0** (2026-01-11): Complete theorem system, parameter validation, documentation
  - Template click behavior fixed
  - 4 theorems documented (Kawasaki, Maekawa, Assembly, Tree)
  - Parameter testing automated
  - Validation modules created

---

**Welcome to the Paper Fold Package Documentation!**

Choose your path above, or start with [QUICK_START.md](QUICK_START.md) for a 5-minute overview.
