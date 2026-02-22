import React from "react";
import { MoveLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PatternText } from "@/components/ui/pattern-text";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PatternDemo = () => {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background px-4">
            <div
                aria-hidden="true"
                className={cn(
                    "pointer-events-none absolute -top-10 left-1/2 size-full -translate-x-1/2 rounded-full",
                    "bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/.1),transparent_50%)]",
                    "blur-[30px]"
                )}
            />

            <div className="z-10 flex flex-col items-center text-center">
                <PatternText text="Expert clinical documentation, guided by AI." className="mb-4" />
                <p className="max-w-[600px] text-muted-foreground">
                    This component uses a custom CSS animation to create a moving pattern effect behind the text.
                    The pattern is styled using your theme's primary color (blue) and is highly responsive.
                </p>
            </div>

            <Button
                variant="ghost"
                className="mt-12 gap-2"
                onClick={() => navigate("/")}
            >
                <MoveLeft className="h-4 w-4" />
                Back to Home
            </Button>

            {/* CareAxis Grid Pattern Background Overlay */}
            <div className="careaxis-grid fixed inset-0 -z-10 opacity-20" />
        </div>
    );
};

export default PatternDemo;
