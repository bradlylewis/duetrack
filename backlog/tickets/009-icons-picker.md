# Ticket 009: Icon Picker Implementation

**ID:** 009  
**Title:** Build icon picker UI and icon asset integration  
**Status:** ✅ IMPLEMENTED  
**Complexity:** Low  
**Priority:** P2 (Medium)

---

## Goal

Implement the icon picker UI and integrate the built-in icon set:
- Create/source 20–40 common bill icons (SVG or PNG).
- Build an icon picker modal/screen with grid layout.
- Allow users to select an icon when adding/editing bills.
- Display selected icon on bill cards and bill details.
- Ensure icons are properly organized and easily extensible.

---

## Acceptance Criteria

1. ✅ Icon set created (20–40 icons) covering common bill categories:
   - Utilities: Electricity, Water, Gas, Internet, Cable TV, Trash.
   - Communication: Phone, Mobile Data.
   - Housing: Rent, Mortgage, Property Tax.
   - Insurance: Home, Auto, Health, Life.
   - Automotive: Car Payment, Gas (Fuel), Maintenance.
   - Subscriptions: Streaming, Music, Software, Gym, Other.
   - Family: Childcare, Education.
   - Finance: Credit Card, Loan.
   - Pet: Veterinary.
   - Other: Donation, Storage.
2. ✅ All icons are in SVG format (or high-res PNG as fallback).
3. ✅ Icon registry created (ICON_MAP) with key, label, category for each icon.
4. ✅ Icon picker modal shows:
   - Grid of icons (4–6 columns per row).
   - Icon labels below each icon.
   - Currently selected icon highlighted (checkmark or border).
   - Scroll if >20 icons.
5. ✅ Icon picker is invoked from Add Bill and Edit Bill forms.
6. ✅ Selected icon key is stored in bill.iconKey.
7. ✅ Icons display correctly on:
   - Bill cards (Dashboard).
   - Bill details screen.
   - Icon picker modal.
8. ✅ Icon picker closes after selection (auto-confirm).
9. ✅ Icons are scalable and render cleanly on various screen sizes.
10. ✅ Fallback/default icon if iconKey is missing or invalid.
11. ✅ Icons are bundled in app (no external downloads).

---

## Manual Test Steps

1. **Icon Asset Creation:**
   - Verify all 20+ icons are created or sourced.
   - Verify icons are in SVG format (or PNG at high resolution).
   - Verify all icons fit within app bundle size budget.

2. **Icon Registry:**
   - Verify ICON_MAP is defined with all icons.
   - Verify each entry has: key, label, category.
   - Verify labels are human-readable (e.g., "Electricity", not "elec_001").

3. **Icon Picker Launch:**
   - From Add Bill form, tap "Select Icon" button.
   - Verify icon picker modal opens.

4. **Icon Grid Display:**
   - Verify icons display in grid (4–6 columns).
   - Verify all icons are visible (scroll if needed).
   - Verify icons are appropriately sized (48x48pt or larger).
   - Verify labels are visible below icons.

5. **Icon Selection:**
   - Tap an icon.
   - Verify it's highlighted (checkmark, border, or background change).
   - Verify previously selected icon is no longer highlighted.

6. **Icon Confirmation:**
   - Tap an icon to select.
   - Verify modal closes.
   - Verify selected icon appears in form (icon preview or label).

7. **Bill Creation with Icon:**
   - Create a bill with a specific icon (e.g., Electricity).
   - Save bill.
   - Return to Dashboard.
   - Verify bill displays the selected icon.

8. **Icon Display on Dashboard:**
   - Verify all bills show their icons correctly.
   - Verify icons are properly sized and aligned on bill cards.
   - Verify icons do not overlap with text.

9. **Icon Display on Bill Details:**
   - Tap a bill to view details.
   - Verify icon is displayed prominently.

10. **Edit Bill – Icon Change:**
    - Edit a bill; change its icon.
    - Save.
    - Verify dashboard updates with new icon.

11. **Default/Fallback Icon:**
    - (Simulate invalid iconKey in DB or corrupt data.)
    - Verify fallback icon displays (does not crash).

12. **Responsive Design:**
    - Test icon picker on small phone screen (iPhone SE).
    - Test on large phone (iPhone 14 Pro Max).
    - Verify grid layout adapts; icons remain usable.

---

## Files Likely Touched / Created

```
src/
├── assets/
│   └── icons/
│       ├── electricity.svg
│       ├── water.svg
│       ├── gas.svg
│       ├── (... all other icons)
│       └── index.ts (exports all icons)
├── components/
│   ├── IconPicker.tsx (new; modal or screen)
│   ├── IconDisplay.tsx (new; for displaying icon on bill card/details)
│   └── (existing components)
├── utils/
│   └── icons.ts (icon registry, ICON_MAP, helper functions)
├── constants/
│   └── icons.ts (optional; icon-related constants)
└── types/
    └── icons.ts (new; icon types & interfaces)
```

---

## Icon Registry

**File:** `src/utils/icons.ts`

```typescript
import ElectricityIcon from '@/src/assets/icons/electricity.svg';
import WaterIcon from '@/src/assets/icons/water.svg';
// ... import all icons

export interface IconInfo {
  icon: React.ComponentType<{ width?: number; height?: number }>;
  label: string;
  category: 'Utilities' | 'Communication' | 'Housing' | 'Insurance' | 'Automotive' | 'Subscriptions' | 'Family' | 'Finance' | 'Pet' | 'Other';
}

export const ICON_MAP: Record<string, IconInfo> = {
  electricity: {
    icon: ElectricityIcon,
    label: 'Electricity',
    category: 'Utilities',
  },
  water: {
    icon: WaterIcon,
    label: 'Water',
    category: 'Utilities',
  },
  // ... all other icons
};

export const getIconComponent = (key: string): React.ComponentType<any> => {
  const info = ICON_MAP[key];
  return info?.icon || DefaultIcon;
};

export const getIconLabel = (key: string): string => {
  return ICON_MAP[key]?.label || 'Unknown';
};

export const getIconsByCategory = (category: string): Array<[string, IconInfo]> => {
  return Object.entries(ICON_MAP).filter(([_, info]) => info.category === category);
};

export const getAllIcons = (): Array<[string, IconInfo]> => {
  return Object.entries(ICON_MAP);
};
```

---

## Icon Picker Component

**File:** `src/components/IconPicker.tsx`

```typescript
import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, Text, Modal } from 'react-native';
import { ICON_MAP, getAllIcons } from '@/src/utils/icons';

interface Props {
  visible: boolean;
  selectedIconKey?: string;
  onSelectIcon: (iconKey: string) => void;
  onClose: () => void;
}

export const IconPicker: React.FC<Props> = ({
  visible,
  selectedIconKey,
  onSelectIcon,
  onClose,
}) => {
  const icons = getAllIcons();

  const handleSelect = (iconKey: string) => {
    onSelectIcon(iconKey);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' }}>
          <Text style={{ fontSize: 18, fontWeight: '600' }}>Choose an Icon</Text>
        </View>

        <FlatList
          data={icons}
          keyExtractor={([key]) => key}
          numColumns={4}
          contentContainerStyle={{ padding: 12 }}
          renderItem={({ item: [iconKey, iconInfo] }) => (
            <TouchableOpacity
              onPress={() => handleSelect(iconKey)}
              style={{
                flex: 1,
                alignItems: 'center',
                padding: 12,
                margin: 4,
                borderRadius: 8,
                backgroundColor: selectedIconKey === iconKey ? '#e0f2f1' : 'transparent',
                borderWidth: selectedIconKey === iconKey ? 2 : 0,
                borderColor: selectedIconKey === iconKey ? '#009688' : 'transparent',
              }}
            >
              <iconInfo.icon width={48} height={48} />
              <Text style={{ fontSize: 10, marginTop: 6, textAlign: 'center', color: '#333' }}>
                {iconInfo.label}
              </Text>
            </TouchableOpacity>
          )}
        />

        <TouchableOpacity
          onPress={onClose}
          style={{
            margin: 16,
            padding: 12,
            backgroundColor: '#007AFF',
            borderRadius: 8,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Done</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};
```

---

## Assumptions

1. **SVG Format Preferred:** Icons are SVG for scalability and small file size.
2. **React Native SVG:** Using `react-native-svg` for SVG rendering (already in typical Expo setup or needs to be added).
3. **Icon Size:** All icons are designed to be rendered at 48x48pt (or larger) without distortion.
4. **Attribution:** Icons are open-source or created in-house (no copyright concerns).
5. **Bundle Size:** Total icons bundle is <500 KB (manageable for app).
6. **No Dynamic Updates:** Icons are static and bundled; no runtime downloads.
7. **Default Icon:** If iconKey is missing, a generic "bill" icon is displayed.

---

## Dependencies

- `react-native-svg` (for SVG rendering).
- `expo-asset` (optional, for asset management).

---

## Definition of Done

- ✅ All 20+ icons created or sourced.
- ✅ Icons are in SVG format (or high-res PNG).
- ✅ Icon registry (ICON_MAP) created and tested.
- ✅ Icon picker modal implemented.
- ✅ Icon picker integrates with Add Bill and Edit Bill forms.
- ✅ Icons display correctly on Dashboard, Bill Details, and Icon Picker.
- ✅ Icon selection persists (saved to bill.iconKey).
- ✅ Fallback icon handles missing/invalid iconKey.
- ✅ Responsive design works on various screen sizes.
- ✅ TypeScript passes; ESLint passes.
- ✅ Manual test steps all pass.
- ✅ Committed to git with clear commit messages.

---

## Notes for Implementation

- Use `react-native-svg` for SVG support (if not already available in Expo).
- Source icons from free libraries: Feather Icons, Material Design Icons, Simple Icons, etc.
- Organize icons into categories for future extensibility.
- Ensure all icons have consistent stroke weight and sizing.
- Test icon rendering on various devices (small and large screens).
- Consider adding a search feature to icon picker (future enhancement).
- Verify icons are accessible (provide `accessibilityLabel` if SVGs support it).
