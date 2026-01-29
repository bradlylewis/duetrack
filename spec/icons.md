# Bill Tracker MVP – Icons Spec

**Version:** 1.0 | **Last Updated:** Jan 28, 2026 | **Status:** Draft

---

## Overview

The app includes a built-in set of 20–40 common bill icons (SVG or PNG). Users select an icon when creating a bill; the icon key is stored in the DB and used to display the icon throughout the app.

---

## Icon Set

### Available Icons (MVP)

| Icon Key | Display Name | Category | Example Contexts |
|----------|--------------|----------|------------------|
| `electricity` | Electricity | Utilities | Power bill, electric company |
| `water` | Water | Utilities | Water/sewer bill |
| `gas` | Gas | Utilities | Natural gas, heating |
| `internet` | Internet | Utilities | ISP, broadband |
| `phone` | Phone | Communication | Cell phone service |
| `rent` | Rent | Housing | Rent, lease payment |
| `mortgage` | Mortgage | Housing | Home loan |
| `insurance_home` | Home Insurance | Insurance | Homeowner's insurance |
| `insurance_auto` | Auto Insurance | Insurance | Car insurance |
| `insurance_health` | Health Insurance | Insurance | Medical coverage |
| `insurance_life` | Life Insurance | Insurance | Life insurance |
| `car_payment` | Car Payment | Automotive | Auto loan |
| `gas_fuel` | Gas (Fuel) | Automotive | Fuel/gas for vehicle |
| `maintenance` | Maintenance | Automotive | Car maintenance, repairs |
| `subscription_streaming` | Streaming | Subscriptions | Netflix, Hulu, etc. |
| `subscription_music` | Music | Subscriptions | Spotify, Apple Music |
| `subscription_software` | Software | Subscriptions | Adobe, Microsoft 365 |
| `subscription_gym` | Gym | Subscriptions | Fitness membership |
| `subscription_other` | Other Subscription | Subscriptions | Generic subscription |
| `childcare` | Childcare | Family | Daycare, nanny |
| `education` | Education | Family | Tuition, student loans |
| `internet_mobile` | Mobile Data | Communication | Mobile hotspot, tethering |
| `cable_tv` | Cable/TV | Utilities | TV subscription |
| `trash` | Trash | Utilities | Garbage/recycling |
| `credit_card` | Credit Card | Finance | Credit card payment |
| `loan` | Loan | Finance | Personal loan |
| `veterinary` | Veterinary | Pet | Vet bills, pet care |
| `property_tax` | Property Tax | Housing | Annual property tax |
| `donation` | Donation | Other | Charity, recurring donation |
| `storage` | Storage | Other | Cloud storage, physical storage |

**Total: 30 icons** (scalable; can add more if needed)

---

## Icon File Structure

### Storage Location
- Icons are bundled in the app (no external downloads in MVP).
- Stored in `/src/assets/icons/`.

### File Formats
- **SVG (preferred):** `electricity.svg`, `water.svg`, etc.
  - Scales well; small file size.
  - Render using `react-native-svg` or similar.
- **PNG (fallback):** If SVG not feasible, use PNG (at least 2x resolution, e.g., 96x96px or larger).

### File Naming Convention
- Filename matches icon key (lowercase, underscore-separated).
- Example: `insurance_home.svg`, `subscription_streaming.svg`.

---

## Icon Picker UI

### Placement
- **On Add Bill screen:** Below the notes field, before the "Save" button.
- **On Edit Bill screen:** Show current selection highlighted; allow user to change.

### Design
- **Grid layout:** 4–6 columns per row (responsive to screen width).
- **Icon size:** 48x48 pt (with padding, total cell ~60x60 pt).
- **Selection indicator:** Checkmark or highlight (e.g., green border or background).
- **Scrollable:** If more than ~20 icons, use vertical scroll.

### User Interaction
1. User scrolls through icon grid.
2. User taps an icon.
3. Icon is highlighted (visual feedback).
4. User taps "Confirm" or "Done" to confirm selection (or auto-confirm on tap).
5. Modal closes; icon key is stored in the form.

### Alternative: Inline Icon Picker
- If space permits, show a horizontal scrollable list of icons below the notes field.
- User taps icon directly to select; no modal.

---

## Icon Storage in Database

### In `bills` Table

```sql
CREATE TABLE bills (
  ...
  iconKey TEXT NOT NULL,  -- e.g., "electricity", "rent", "subscription_streaming"
  ...
);
```

### Icon Resolution at Runtime

```typescript
// In component code
import { getIconComponent } from '@/src/utils/icons';

const iconKey = bill.iconKey; // e.g., "electricity"
const IconComponent = getIconComponent(iconKey);

// Render
<IconComponent width={48} height={48} />
```

---

## Icon Utility Functions

### Icon Registry

**File:** `/src/utils/icons.ts` (or `/src/constants/icons.ts`)

```typescript
import ElectricityIcon from '@/src/assets/icons/electricity.svg';
import WaterIcon from '@/src/assets/icons/water.svg';
// ... import all icons

export const ICON_MAP = {
  electricity: { icon: ElectricityIcon, label: 'Electricity', category: 'Utilities' },
  water: { icon: WaterIcon, label: 'Water', category: 'Utilities' },
  // ... all other icons
};

export const getIconComponent = (key: string) => ICON_MAP[key]?.icon || DefaultIcon;

export const getIconLabel = (key: string) => ICON_MAP[key]?.label || 'Unknown';

export const getIconsByCategory = (category: string) => 
  Object.entries(ICON_MAP)
    .filter(([_, info]) => info.category === category)
    .map(([key, info]) => ({ key, ...info }));

export const getAllIcons = () => 
  Object.entries(ICON_MAP).map(([key, info]) => ({ key, ...info }));
```

---

## Default Icon (Fallback)

If an icon key is not found (e.g., corrupted data or version mismatch):
- Display a **generic bill icon** (e.g., 💵, 📋, or a generic document icon).
- Log a warning to console (dev only).
- Do NOT crash or show error UI.

---

## Icon Picker Component

**File:** `/src/components/IconPicker.tsx`

```typescript
import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, Text } from 'react-native';
import { ICON_MAP, getAllIcons } from '@/src/utils/icons';

interface IconPickerProps {
  selectedIconKey?: string;
  onSelectIcon: (iconKey: string) => void;
}

export const IconPicker: React.FC<IconPickerProps> = ({ selectedIconKey, onSelectIcon }) => {
  const icons = getAllIcons();

  return (
    <View>
      <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
        Choose an icon
      </Text>
      <FlatList
        data={icons}
        keyExtractor={(item) => item.key}
        numColumns={4}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => onSelectIcon(item.key)}
            style={{
              flex: 1,
              alignItems: 'center',
              padding: 8,
              borderRadius: 8,
              backgroundColor: selectedIconKey === item.key ? '#e0f2f1' : 'transparent',
              borderWidth: selectedIconKey === item.key ? 2 : 0,
              borderColor: selectedIconKey === item.key ? '#009688' : 'transparent',
            }}
          >
            <item.icon width={48} height={48} />
            <Text style={{ fontSize: 10, marginTop: 4, textAlign: 'center' }}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};
```

---

## Future Enhancements (Out of MVP Scope)

- **Custom colors:** Allow users to tint icons (e.g., red for urgent, green for autopay).
- **Icon search:** Search by icon name or category.
- **User-uploaded icons:** Custom emoji or photos.
- **Icon suggestions:** ML-based suggestions based on bill name (e.g., "electricity" auto-suggests electricity icon).
- **Public icon search:** Integration with external icon APIs (e.g., Noun Project, Flaticon).

---

## Testing & QA

- Verify all 30 icons render correctly on both iOS and Android.
- Test icon picker on phones with small screens (e.g., SE-size).
- Verify selected icon persists after save.
- Test icon display on bill cards (grid and list views).
- Test fallback behavior if icon key is missing or corrupted.
