import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <div className="text-6xl font-bold font-mono text-accent-green mb-4">
        404
      </div>
      <h1 className="text-2xl font-semibold mb-2">Page not found</h1>
      <p className="text-text-muted text-sm mb-8 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <ButtonLink href="/">Go home</ButtonLink>
    </div>
  );
}
