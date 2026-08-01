"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

const emailSchema = z.object({
  email: z.string().email("Informe um e-mail válido."),
});

const passwordSchema = z.object({
  password: z.string().min(1, "Informe a senha."),
});

type EmailFormValues = z.infer<typeof emailSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function LoginPage() {
  const { login, checkEmail } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  const emailForm = useForm<EmailFormValues>({ resolver: zodResolver(emailSchema) });
  const passwordForm = useForm<PasswordFormValues>({ resolver: zodResolver(passwordSchema) });

  async function onSubmitEmail(values: EmailFormValues) {
    setIsSubmitting(true);
    try {
      const exists = await checkEmail(values.email);
      if (exists) {
        setEmail(values.email);
      } else {
        router.push(`/register?email=${encodeURIComponent(values.email)}`);
      }
    } catch {
      toast.error("Não foi possível verificar o e-mail. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onSubmitPassword(values: PasswordFormValues) {
    if (!email) return;
    setIsSubmitting(true);
    try {
      await login(email, values.password);
    } catch {
      toast.error("Credenciais inválidas. Verifique e-mail e senha.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>FinancialManagement</CardTitle>
          <CardDescription>
            {email ? "Informe sua senha para continuar." : "Informe seu e-mail para entrar ou criar uma conta."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!email ? (
            <form key="email-step" onSubmit={emailForm.handleSubmit(onSubmitEmail)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" placeholder="voce@empresa.com" {...emailForm.register("email")} />
                {emailForm.formState.errors.email && (
                  <p className="text-sm text-destructive">{emailForm.formState.errors.email.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Verificando..." : "Continuar"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Não tem uma conta?{" "}
                <Link href="/register" className="font-medium text-primary hover:underline">
                  Cadastre-se
                </Link>
              </p>
            </form>
          ) : (
            <form key="password-step" onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-4">
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input value={email} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" autoFocus {...passwordForm.register("password")} />
                {passwordForm.formState.errors.password && (
                  <p className="text-sm text-destructive">{passwordForm.formState.errors.password.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Entrando..." : "Entrar"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setEmail(null);
                  passwordForm.reset();
                }}
              >
                Usar outro e-mail
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
