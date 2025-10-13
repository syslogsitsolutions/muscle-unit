"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, RefreshCw, XCircle, Pause } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useResetMembership } from "@/hooks/use-membership";
import { toast } from "sonner";

interface ResetMembershipDialogProps {
  membershipId: string;
  memberName: string;
  children?: React.ReactNode;
}

export function ResetMembershipDialog({
  membershipId,
  memberName,
  children,
}: ResetMembershipDialogProps) {
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<"cancel" | "suspend" | "restart">("cancel");
  const [notes, setNotes] = useState("");
  const router = useRouter();
  const queryClient = useQueryClient();
  const resetMutation = useResetMembership();

  const handleReset = async () => {
    try {
      await resetMutation.mutateAsync({
        id: membershipId,
        action,
        notes,
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["memberships"] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["member", membershipId] });

      toast.success(`Membership ${action}led successfully`, {
        description: `${memberName}'s membership has been ${action}led.`,
      });

      setOpen(false);
      setNotes("");
      router.refresh();
    } catch (error) {
      console.error("Reset membership error:", error);
      toast.error("Failed to reset membership", {
        description: "Please try again or contact support.",
      });
    }
  };

  const getActionDescription = () => {
    switch (action) {
      case "cancel":
        return "This will permanently cancel the membership. The member will be marked as inactive and payment will be reset to unpaid.";
      case "suspend":
        return "This will temporarily suspend/freeze the membership. The member will be marked as inactive but can be reactivated later.";
      case "restart":
        return "This will reset the membership dates to start from today with the same duration. Payment status will be reset to pending.";
      default:
        return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Membership
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Reset Membership</DialogTitle>
          <DialogDescription>
            Choose how you want to reset the membership for {memberName}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <Label>Reset Action</Label>
            <RadioGroup
              value={action}
              onValueChange={(value) =>
                setAction(value as "cancel" | "suspend" | "restart")
              }
              className="space-y-3"
            >
              <div className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="cancel" id="cancel" className="mt-1" />
                <div className="flex-1 space-y-1">
                  <Label
                    htmlFor="cancel"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <XCircle className="h-4 w-4 text-red-500" />
                    Cancel Membership
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Permanently cancel and mark member as inactive
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="suspend" id="suspend" className="mt-1" />
                <div className="flex-1 space-y-1">
                  <Label
                    htmlFor="suspend"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Pause className="h-4 w-4 text-orange-500" />
                    Suspend/Freeze Membership
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Temporarily suspend until reactivated
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="restart" id="restart" className="mt-1" />
                <div className="flex-1 space-y-1">
                  <Label
                    htmlFor="restart"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="h-4 w-4 text-blue-500" />
                    Restart Membership
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Reset dates and start fresh from today
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              {getActionDescription()}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes about this action..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={resetMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleReset}
            disabled={resetMutation.isPending}
            variant={action === "cancel" ? "destructive" : "default"}
          >
            {resetMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>Confirm Reset</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

