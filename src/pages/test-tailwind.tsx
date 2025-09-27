import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { CheckCircle } from 'lucide-react'

export default function TestTailwind() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">
            Tailwind CSS 4+ Test Page
          </h1>
          <p className="text-muted-foreground text-lg">
            Testing the updated Tailwind configuration with our design system.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Button Variants</CardTitle>
              <CardDescription>Testing all button variants</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="default">Default Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="destructive">Destructive Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="link">Link Button</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Badge Variants</CardTitle>
              <CardDescription>Testing all badge variants</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-x-2">
                <Badge variant="default">Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
              </div>
              <div className="space-x-2">
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
              <div className="space-x-2">
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Form Elements</CardTitle>
              <CardDescription>Testing input and form styling</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Default input" />
              <Input placeholder="Email input" type="email" />
              <Input placeholder="Disabled input" disabled />
            </CardContent>
          </Card>

          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Color System Test</CardTitle>
              <CardDescription>Testing CSS custom properties and color system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div className="space-y-2">
                  <div className="h-16 bg-primary rounded-md"></div>
                  <p className="text-sm font-medium">Primary</p>
                </div>
                <div className="space-y-2">
                  <div className="h-16 bg-secondary rounded-md"></div>
                  <p className="text-sm font-medium">Secondary</p>
                </div>
                <div className="space-y-2">
                  <div className="h-16 bg-accent rounded-md"></div>
                  <p className="text-sm font-medium">Accent</p>
                </div>
                <div className="space-y-2">
                  <div className="h-16 bg-muted rounded-md"></div>
                  <p className="text-sm font-medium">Muted</p>
                </div>
                <div className="space-y-2">
                  <div className="h-16 bg-destructive rounded-md"></div>
                  <p className="text-sm font-medium">Destructive</p>
                </div>
                <div className="space-y-2">
                  <div className="h-16 bg-card border rounded-md"></div>
                  <p className="text-sm font-medium">Card</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Typography Test</CardTitle>
              <CardDescription>Testing typography classes and font imports</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold">Heading 1 - Inter Bold</h1>
                <h2 className="text-3xl font-semibold">Heading 2 - Inter Semibold</h2>
                <h3 className="text-2xl font-medium">Heading 3 - Inter Medium</h3>
                <p className="text-lg">Large paragraph text - Inter Regular</p>
                <p className="text-base text-muted-foreground">Regular paragraph text with muted color</p>
                <p className="text-sm">Small text - Inter Regular</p>
                <code className="font-mono text-sm bg-muted px-2 py-1 rounded">
                  Code text - JetBrains Mono
                </code>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 p-6 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
          <h2 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-2 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Tailwind 4+ Setup Test
          </h2>
          <p className="text-green-700 dark:text-green-300">
            If you can see this page with proper styling, colors, fonts, and components,
            then the Tailwind CSS 4+ configuration is working correctly!
          </p>
        </div>
      </div>
    </div>
  )
}