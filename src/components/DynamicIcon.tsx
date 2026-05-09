import * as Icons from "lucide-react";
import { Pill } from "lucide-react";

export function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const Comp = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name];
  const C = Comp ?? Pill;
  return <C className={className} />;
}
