# Monday Sippin' Brand Design System

## Color Palette

### Primary Brand Colors
- **Deep Teal**: `#1B4B5A` - Primary brand color, used for headings and main elements
- **Warm Orange**: `#F4A261` - Secondary brand color, used for accents and CTAs
- **Rich Purple**: `#6B46C1` - Tertiary brand color, used for subheadings and highlights
- **Sage Green**: `#52B788` - Supporting color, used for success states and nature themes
- **Coral Pink**: `#E76F51` - Supporting color, used for warm accents and highlights

### Usage in Tailwind
```css
/* Direct color usage */
.text-brand-deep-teal
.bg-brand-warm-orange
.border-brand-rich-purple

/* Gradient utilities */
.bg-gradient-brand-primary      /* Deep Teal to Warm Orange */
.bg-gradient-brand-secondary    /* Rich Purple to Coral Pink */
.bg-gradient-brand-accent       /* Sage Green to Deep Teal */
.bg-gradient-brand-warm         /* Warm Orange to Coral Pink */
.bg-gradient-brand-cool         /* Deep Teal to Rich Purple */
.bg-gradient-brand-nature       /* Sage Green to Warm Orange */

/* Text gradients */
.text-gradient-brand-primary
.text-gradient-brand-secondary
.text-gradient-brand-accent
```

## Typography

### Font Family
- **Primary**: Manrope (200-800 weights)
- **Fallback**: System UI fonts

### Typography Variants
```tsx
<Typography variant="h1">Main Heading</Typography>
<Typography variant="h2">Section Heading</Typography>
<Typography variant="h3">Subsection Heading</Typography>
<Typography variant="body">Regular body text</Typography>
<Typography variant="brand-heading">Brand-styled heading</Typography>
<Typography variant="brand-gradient">Gradient text</Typography>
```

### Font Weights
- **Extra Light**: 200
- **Light**: 300
- **Normal**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700
- **Extrabold**: 800

## Components

### Button Variants
```tsx
<Button variant="brand">Primary Brand Button</Button>
<Button variant="brand-secondary">Secondary Brand Button</Button>
<Button variant="brand-accent">Accent Brand Button</Button>
<Button variant="brand-outline">Outline Brand Button</Button>
<Button variant="brand-ghost">Ghost Brand Button</Button>
```

### Card Variants
```tsx
<Card variant="brand">Brand Gradient Card</Card>
<Card variant="brand-secondary">Secondary Brand Card</Card>
<Card variant="brand-outline">Brand Outline Card</Card>
<Card variant="elevated">Elevated Card</Card>
<Card variant="glass">Glass Effect Card</Card>
```

### Badge Variants
```tsx
<Badge variant="brand">Brand Badge</Badge>
<Badge variant="brand-warm">Warm Orange Badge</Badge>
<Badge variant="brand-purple">Purple Badge</Badge>
<Badge variant="brand-gradient">Gradient Badge</Badge>
<Badge variant="brand-soft">Soft Brand Badge</Badge>
```

### Avatar Variants
```tsx
<Avatar variant="brand" size="lg">
  <AvatarImage src="/avatar.jpg" />
  <AvatarFallback>MS</AvatarFallback>
</Avatar>
```

## Design Principles

### 1. Vibrant Professional
- Use gradients for primary actions and hero elements
- Maintain high contrast for accessibility
- Balance vibrant colors with neutral backgrounds

### 2. Consistent Spacing
- Use Tailwind's spacing scale consistently
- Maintain 8px grid system
- Use consistent padding and margins across components

### 3. Typography Hierarchy
- Use Manrope Extrabold for main headings
- Use brand colors to establish visual hierarchy
- Maintain consistent line heights and spacing

### 4. Interactive Elements
- Use hover effects and transitions
- Implement subtle animations for better UX
- Maintain consistent focus states

## Usage Examples

### Hero Section
```tsx
<div className="bg-gradient-brand-primary text-white p-12 rounded-xl">
  <Typography variant="h1" className="text-white mb-4">
    Monday Sippin'
  </Typography>
  <Typography variant="lead" className="text-white/90 mb-8">
    Your weekly dose of crypto and finance insights
  </Typography>
  <Button variant="brand-secondary" size="lg">
    Get Started
  </Button>
</div>
```

### Article Card
```tsx
<Card variant="elevated" className="hover:shadow-xl transition-all">
  <CardHeader>
    <Badge variant="brand-soft">Crypto</Badge>
    <CardTitle>
      <Typography variant="h3">Article Title</Typography>
    </CardTitle>
    <CardDescription>
      <Typography variant="body-small">Article excerpt...</Typography>
    </CardDescription>
  </CardHeader>
  <CardContent>
    <Typography variant="body">Article content...</Typography>
  </CardContent>
  <CardFooter>
    <Button variant="brand-ghost">Read More</Button>
  </CardFooter>
</Card>
```

### Navigation
```tsx
<nav className="bg-white border-b border-brand-deep-teal/10">
  <div className="flex items-center justify-between p-4">
    <Typography variant="brand-gradient" className="text-xl font-bold">
      Monday Sippin'
    </Typography>
    <div className="flex gap-4">
      <Button variant="brand-ghost">Articles</Button>
      <Button variant="brand-ghost">Categories</Button>
      <Button variant="brand">Subscribe</Button>
    </div>
  </div>
</nav>
```

## Accessibility

- All color combinations meet WCAG 2.1 AA contrast requirements
- Focus states are clearly visible
- Interactive elements have appropriate sizing (min 44px touch targets)
- Typography scales appropriately across devices
- Gradients include fallback colors for better accessibility