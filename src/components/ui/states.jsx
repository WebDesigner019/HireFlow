import { AlertCircle, Inbox } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({ title = "No records found", description = "Try changing the filters." }) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center gap-2 py-10 text-center">
        <Inbox className="h-8 w-8 text-slate-400" />
        <p className="font-semibold text-slate-900">{title}</p>
        <p className="text-sm text-slate-500">{description}</p>
      </CardContent>
    </Card>
  );
}

export function ErrorState({ title = "Something went wrong", description = "The dashboard could not load this view." }) {
  return (
    <Card className="border-red-100 bg-red-50">
      <CardContent className="flex items-center gap-3 py-5">
        <AlertCircle className="h-5 w-5 text-danger" />
        <div>
          <p className="font-semibold text-red-900">{title}</p>
          <p className="text-sm text-red-700">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
