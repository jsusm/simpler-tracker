import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Trash2Icon } from "lucide-react";
import { clearSessionCreateActivityStepFormState, type CreateActivityDispatcherType, type CreateActivityStepFormStateType } from "#/hooks/useCreateActivityFormState";
import { useMutation } from "@tanstack/react-query";
import { createActivityAndMetricsSF } from "#/server/activities";
import { SubmittingButton } from "../ui/SubmittingButton";
import { useNavigate } from "@tanstack/react-router";

export function ActivityFormCheckout({ dispatcher: formDispatcher, formState: activityFormState }: { dispatcher: CreateActivityDispatcherType, formState: CreateActivityStepFormStateType }) {
  const navigate = useNavigate()
  const { mutateAsync: createActivityMutation, isPending } = useMutation({
    mutationFn: createActivityAndMetricsSF,
    onSuccess() {
      clearSessionCreateActivityStepFormState()
      navigate({to: '/'})
    }
  })
const handleCreateActivity = () => {
  createActivityMutation({ data: activityFormState.data })
}
return (
  <div>
    <Card>
      <CardHeader className="">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">{activityFormState.data.title}</CardTitle>
          <Button size="sm" variant={'secondary'} onClick={_ => formDispatcher({ type: 'goToActivityForm' })}>Edit</Button>
        </div>
        <CardDescription>
          {activityFormState.data.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm leading-none font-medium ">Metrics</p>

          <ul className="flex flex-col gap-2">
            {activityFormState.data.metrics.map((m, idx) => (
              <li className="relative flex items-center" key={m.label}>
                <Button variant="outline" className="justify-between pr-8 w-full" onClick={() => { formDispatcher({ type: 'goToMetric', payload: { idx } }) }}>
                  <span>
                    {m.label}
                  </span>
                  <div className="flex gap-2 items-center">
                    <span className="text-muted-foreground">
                      {m.type === 'numeric' ? 'Numeric' : m.qualitativeLabels.join(', ')}
                    </span>
                  </div>
                </Button>
                <Button size="icon-xs" className="absolute right-1" variant={"destructive"} onClick={e => {
                  e.stopPropagation();
                  formDispatcher({ type: 'removeMetric', payload: { idx } })
                }}>
                  <Trash2Icon className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-stretch md:flex-row gap-2 justify-stretch">
        <Button variant="outline" onClick={_ => formDispatcher({ type: 'goToAddNewMetric' })}>Add new Metric</Button>
        <SubmittingButton isSubmitting={isPending} className="md:flex-1" onClick={handleCreateActivity}>Create Activity</SubmittingButton>
      </CardFooter>
    </Card>
  </div>
)
}
