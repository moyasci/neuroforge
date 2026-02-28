import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <Brain className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">新規登録</CardTitle>
          <p className="text-sm text-muted-foreground">
            NeuroForge アカウントを作成
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            現在、OAuth 認証のみ対応しています。
            ログインページから GitHub または Google でサインインしてください。
          </p>
          <Button className="w-full" asChild>
            <a href="/login">ログインページへ</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
