import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Cross, Eye, EyeOff, Loader2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import careAxisLogo from "@/assets/careaxis-logo.png";
import loginSideImage from "@/assets/login-side.png";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";
import { getApiErrorMessage, login, register } from "@/lib/api";
import { getAuthToken, setAuthSession } from "@/lib/demo-auth";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").max(255, "Email is too long."),
  password: z.string().min(8, "Password must be at least 8 characters.").max(128, "Password is too long."),
  rememberMe: z.boolean().default(false),
});

const registerSchema = z
  .object({
    full_name: z.string().trim().min(2, "Full name is required.").max(120, "Name is too long."),
    organization: z.string().trim().min(2, "Organization is required.").max(120, "Organization is too long."),
    email: z.string().trim().email("Enter a valid email address.").max(255, "Email is too long."),
    password: z.string().min(8, "Password must be at least 8 characters.").max(128, "Password is too long."),
    confirmPassword: z.string().min(8, "Confirm your password."),
  })
  .superRefine((values, ctx) => {
    if (values.password !== values.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Passwords do not match.",
      });
    }
  });

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

function IllustrationPanel() {
  return (
    <div className="relative h-[420px] w-full overflow-hidden rounded-3xl border bg-card/70 shadow-lg shadow-primary/5 backdrop-blur sm:h-[520px]">
      <img
        src={loginSideImage}
        alt="Healthcare illustration"
        className="h-full w-full object-cover"
        loading="lazy"
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(700px 420px at 20% 10%, hsl(var(--primary) / 0.12), transparent 60%), radial-gradient(520px 360px at 90% 15%, hsl(var(--success) / 0.10), transparent 62%)",
        }}
      />
    </div>
  );
}

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = React.useState(false);
  const [language, setLanguage] = React.useState<"English" | "Hindi" | "Regional">("English");
  const [mode, setMode] = React.useState<"login" | "register">("login");

  React.useEffect(() => {
    if (getAuthToken()) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    mode: "onTouched",
  });

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: "",
      organization: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onTouched",
  });

  const isLoginLoading = loginForm.formState.isSubmitting;
  const isRegisterLoading = registerForm.formState.isSubmitting;
  const isLoading = mode === "login" ? isLoginLoading : isRegisterLoading;

  const onLoginSubmit = async (values: LoginValues) => {
    try {
      const response = await login({ email: values.email, password: values.password });
      setAuthSession(response.access_token, response.user);
      toast.success("Signed in", {
        description: "Redirecting to dashboard...",
      });

      const from = (location.state as { from?: string } | null)?.from;
      navigate(typeof from === "string" ? from : "/dashboard");
    } catch (error) {
      toast.error("Sign in failed", {
        description: getApiErrorMessage(error),
      });
    }
  };

  const onRegisterSubmit = async (values: RegisterValues) => {
    try {
      await register({
        full_name: values.full_name,
        organization: values.organization,
        email: values.email,
        password: values.password,
      });

      toast.success("Registration successful", {
        description: "You can sign in now.",
      });

      setMode("login");
      loginForm.setValue("email", values.email);
      loginForm.setValue("password", values.password);
      registerForm.reset();
    } catch (error) {
      toast.error("Registration failed", {
        description: getApiErrorMessage(error),
      });
    }
  };

  return (
    <AuroraBackground className="min-h-screen">
      <main className="min-h-screen bg-background">
        <section className="mx-auto min-h-screen max-w-6xl px-4 py-10 sm:px-6">
          <div className="grid min-h-[calc(100vh-5rem)] items-center gap-10 lg:grid-cols-[1.08fr_0.92fr]">
            <div>
              <header className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={careAxisLogo} alt="CareAxis CoPilot logo" className="h-10 w-auto" loading="eager" />
                  <div className="hidden text-sm font-medium text-muted-foreground sm:block">CareAxis CoPilot</div>
                </div>
              </header>

              <div className="mt-10">
                <h1
                  className="text-pretty text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Expert clinical documentation,
                  <span className="text-primary"> guided by AI</span>.
                </h1>
                <p className="mt-4 max-w-xl text-pretty text-base text-muted-foreground">
                  A secure workspace for clinicians to draft, review, and finalize structured notes faster, with fewer
                  omissions.
                </p>

                <div className="mt-8">
                  <Card className="w-full max-w-md border-border/70 bg-card/90 shadow-lg shadow-primary/5 backdrop-blur">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <Cross className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <div>
                          <CardTitle style={{ fontFamily: "var(--font-display)" }}>
                            {mode === "login" ? "Sign in" : "Register"}
                          </CardTitle>
                          <CardDescription>AI-Assisted Clinical Documentation Platform</CardDescription>
                        </div>
                      </div>

                      <div className="mt-3 flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant={mode === "login" ? "default" : "outline"}
                          onClick={() => setMode("login")}
                        >
                          Sign In
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={mode === "register" ? "default" : "outline"}
                          onClick={() => setMode("register")}
                        >
                          Register
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent>
                      {mode === "login" ? (
                        <Form key="login" {...loginForm}>
                          <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5" aria-busy={isLoading}>
                            <FormField
                              control={loginForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type="email"
                                      autoComplete="email"
                                      placeholder="name@hospital.org"
                                      disabled={isLoginLoading}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={loginForm.control}
                              name="password"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Password</FormLabel>
                                  <div className="relative">
                                    <FormControl>
                                      <Input
                                        {...field}
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        placeholder="********"
                                        disabled={isLoginLoading}
                                      />
                                    </FormControl>

                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="absolute right-1 top-1 h-8 w-8"
                                      onClick={() => setShowPassword((s) => !s)}
                                      aria-label={showPassword ? "Hide password" : "Show password"}
                                      disabled={isLoading}
                                    >
                                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <FormField
                                control={loginForm.control}
                                name="rememberMe"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-start gap-2 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={(v) => field.onChange(Boolean(v))}
                                        disabled={isLoginLoading}
                                        aria-label="Remember me"
                                      />
                                    </FormControl>
                                    <div className="leading-none">
                                      <FormLabel className="cursor-pointer">Remember Me</FormLabel>
                                    </div>
                                  </FormItem>
                                )}
                              />

                              <Button
                                type="button"
                                variant="link"
                                className="h-auto p-0 text-sm"
                                disabled={isLoginLoading}
                                onClick={() =>
                                  toast.message("Forgot Password", {
                                    description: "Password reset is not wired yet.",
                                  })
                                }
                              >
                                Forgot Password
                              </Button>
                            </div>

                            <Button type="submit" className="w-full" disabled={isLoginLoading}>
                              {isLoginLoading ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                                  Signing in...
                                </>
                              ) : (
                                "Sign In"
                              )}
                            </Button>
                          </form>
                        </Form>
                      ) : (
                        <Form key="register" {...registerForm}>
                          <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-5" aria-busy={isLoading}>
                            <FormField
                              control={registerForm.control}
                              name="full_name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Full Name</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="Doctor full name" disabled={isRegisterLoading} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={registerForm.control}
                              name="organization"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Organization</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="Hospital / clinic name" disabled={isRegisterLoading} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={registerForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email</FormLabel>
                                  <FormControl>
                                    <Input {...field} type="email" placeholder="name@hospital.org" disabled={isRegisterLoading} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={registerForm.control}
                              name="password"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Password</FormLabel>
                                  <FormControl>
                                    <Input {...field} type="password" placeholder="********" disabled={isRegisterLoading} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={registerForm.control}
                              name="confirmPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Confirm Password</FormLabel>
                                  <FormControl>
                                    <Input {...field} type="password" placeholder="********" disabled={isRegisterLoading} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <Button type="submit" className="w-full" disabled={isRegisterLoading}>
                              {isRegisterLoading ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                                  Creating account...
                                </>
                              ) : (
                                "Create Account"
                              )}
                            </Button>
                          </form>
                        </Form>
                      )}

                      <div className="mt-5 border-t pt-4">
                        <div className="grid gap-3 sm:grid-cols-3 sm:items-center">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="h-2 w-2 rounded-full bg-success" aria-hidden="true" />
                            <span>Online</span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 sm:justify-center">
                            <Badge variant="secondary">HIPAA</Badge>
                            <Badge variant="secondary">Digital Health Records Bill 2025</Badge>
                          </div>

                          <div className="flex items-center gap-2 sm:justify-end">
                            <span className="text-sm text-muted-foreground">Language</span>
                            <Select value={language} onValueChange={(v) => setLanguage(v as typeof language)}>
                              <SelectTrigger className="h-9 w-[150px]" aria-label="Select language">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="English">English</SelectItem>
                                <SelectItem value="Hindi">Hindi</SelectItem>
                                <SelectItem value="Regional">Regional</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="mt-3 flex justify-start sm:justify-end">
                          <Button
                            type="button"
                            variant="link"
                            className="h-auto p-0 text-sm"
                            onClick={() =>
                              toast.message("Support", {
                                description: "Support is not wired yet.",
                              })
                            }
                          >
                            Need Help? Contact Support
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            <aside className="hidden lg:block">
              <IllustrationPanel />
            </aside>
          </div>

          <div className="mt-10 lg:hidden">
            <IllustrationPanel />
          </div>
        </section>
      </main>
    </AuroraBackground>
  );
};

export default Index;
