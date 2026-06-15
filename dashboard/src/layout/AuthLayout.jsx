import Logo from "@/components/shared/Logo";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function AuthLayout({
  title,
  description,
  children,
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md border border-border/50 bg-card/70 shadow-xl backdrop-blur-md [--card-spacing:2rem]">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <Logo />
          </div>

          <div className="space-y-1">
            <CardTitle className="text-2xl font-semibold">
              {title}
            </CardTitle>

            <CardDescription>
              {description}
            </CardDescription>
          </div>
        </CardHeader>

        {children}
      </Card>
    </div>
  );
}