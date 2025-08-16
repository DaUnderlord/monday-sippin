import React from 'react';
import { Button } from './button';
import { Card, CardHeader, CardTitle, CardContent } from './card';
import { Typography } from './typography';
import { Badge } from './badge';
import { Avatar, AvatarFallback } from './avatar';
import { Separator } from './separator';

export function BrandSystemTest() {
  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Typography Test */}
        <section className="space-y-4">
          <Typography variant="h1">Monday Sippin&apos; Design System</Typography>
          <Typography variant="h2">Typography Examples</Typography>
          <Typography variant="body">
            This is a test of the Monday Sippin&apos; brand design system implementation.
          </Typography>
          <Typography variant="brand-gradient">
            Gradient Text Example
          </Typography>
        </section>

        <Separator variant="brand" className="my-8" />

        {/* Button Test */}
        <section className="space-y-4">
          <Typography variant="h3">Button Variants</Typography>
          <div className="flex flex-wrap gap-4">
            <Button variant="brand">Brand Primary</Button>
            <Button variant="brand-secondary">Brand Secondary</Button>
            <Button variant="brand-accent">Brand Accent</Button>
            <Button variant="brand-outline">Brand Outline</Button>
            <Button variant="brand-ghost">Brand Ghost</Button>
          </div>
        </section>

        <Separator variant="default" className="my-8" />

        {/* Card Test */}
        <section className="space-y-4">
          <Typography variant="h3">Card Variants</Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card variant="default">
              <CardHeader>
                <CardTitle>Default Card</CardTitle>
              </CardHeader>
              <CardContent>
                <Typography variant="body-small">
                  This is a default card variant.
                </Typography>
              </CardContent>
            </Card>

            <Card variant="brand">
              <CardHeader>
                <CardTitle className="text-white">Brand Card</CardTitle>
              </CardHeader>
              <CardContent>
                <Typography variant="body-small" className="text-white/90">
                  This is a brand gradient card.
                </Typography>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Elevated Card</CardTitle>
              </CardHeader>
              <CardContent>
                <Typography variant="body-small">
                  This is an elevated card with shadow.
                </Typography>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator variant="brand-accent" className="my-8" />

        {/* Badge Test */}
        <section className="space-y-4">
          <Typography variant="h3">Badge Variants</Typography>
          <div className="flex flex-wrap gap-2">
            <Badge variant="brand">Brand</Badge>
            <Badge variant="brand-warm">Warm</Badge>
            <Badge variant="brand-purple">Purple</Badge>
            <Badge variant="brand-green">Green</Badge>
            <Badge variant="brand-gradient">Gradient</Badge>
            <Badge variant="brand-soft">Soft</Badge>
          </div>
        </section>

        <Separator variant="default" className="my-8" />

        {/* Avatar Test */}
        <section className="space-y-4">
          <Typography variant="h3">Avatar Variants</Typography>
          <div className="flex gap-4 items-center">
            <Avatar variant="default" size="sm">
              <AvatarFallback>MS</AvatarFallback>
            </Avatar>
            <Avatar variant="brand" size="default">
              <AvatarFallback className="text-white">MS</AvatarFallback>
            </Avatar>
            <Avatar variant="brand-secondary" size="lg">
              <AvatarFallback className="text-white">MS</AvatarFallback>
            </Avatar>
            <Avatar variant="brand-accent" size="xl">
              <AvatarFallback className="text-white">MS</AvatarFallback>
            </Avatar>
          </div>
        </section>

        {/* Color Palette Test */}
        <section className="space-y-4">
          <Typography variant="h3">Brand Color Palette</Typography>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-deep-teal rounded-lg mx-auto mb-2"></div>
              <Typography variant="small">Deep Teal</Typography>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-warm-orange rounded-lg mx-auto mb-2"></div>
              <Typography variant="small">Warm Orange</Typography>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-rich-purple rounded-lg mx-auto mb-2"></div>
              <Typography variant="small">Rich Purple</Typography>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-sage-green rounded-lg mx-auto mb-2"></div>
              <Typography variant="small">Sage Green</Typography>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-coral-pink rounded-lg mx-auto mb-2"></div>
              <Typography variant="small">Coral Pink</Typography>
            </div>
          </div>
        </section>

        {/* Gradient Test */}
        <section className="space-y-4">
          <Typography variant="h3">Brand Gradients</Typography>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-24 bg-gradient-brand-primary rounded-lg flex items-center justify-center">
              <Typography variant="body" className="text-white font-semibold">
                Primary Gradient
              </Typography>
            </div>
            <div className="h-24 bg-gradient-brand-secondary rounded-lg flex items-center justify-center">
              <Typography variant="body" className="text-white font-semibold">
                Secondary Gradient
              </Typography>
            </div>
            <div className="h-24 bg-gradient-brand-accent rounded-lg flex items-center justify-center">
              <Typography variant="body" className="text-white font-semibold">
                Accent Gradient
              </Typography>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}