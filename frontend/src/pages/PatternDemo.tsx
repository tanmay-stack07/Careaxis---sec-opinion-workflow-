import { PatternText } from "@/components/ui/pattern-text";
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PatternDemo() {
    const navigate = useNavigate();

    return (
        <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background overflow-hidden p-4">
            {/* Back Button */}
            <div className="absolute top-8 left-8 z-50">
                <Button
                    variant="ghost"
                    onClick={() => navigate("/")}
                    className="gap-2 text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="size-4" />
                    Back to Home
                </Button>
            </div>

            <div
                aria-hidden="true"
                className={cn(
                    'pointer-events-none absolute -top-10 left-1/2 size-full -translate-x-1/2 rounded-full',
                    'bg-[radial-gradient(ellipse_at_center,theme(colors.foreground/0.1),transparent_50%)]',
                    'blur-[30px]',
                )}
            />

            <div className="max-w-4xl text-center z-10">
                <PatternText
                    text="Expert clinical documentation, guided by AI."
                    className="text-primary"
                />

                <p className="mt-8 text-xl text-muted-foreground max-w-2xl mx-auto">
                    Experience the future of medical diagnostics with CareAxis. Our AI CoPilot patterns match professional excellence with precision.
                </p>
            </div>

            {/* Grid Pattern Background */}
            <div className="careaxis-grid absolute inset-0 -z-10" />
        </div>
    );
}
