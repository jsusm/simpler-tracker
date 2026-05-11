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
import type { CreateActivityDispatcherType, CreateActivityStepFormStateType } from "#/hooks/useCreateActivityFormState";

export function ActivityFormCheckout({ dispatcher: formDispatcher, formState: activityFormState }: { dispatcher: CreateActivityDispatcherType, formState: CreateActivityStepFormStateType }) {
  return (
    <div>
      <Card>
        <CardHeader className="">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">{activityFormState.data.title}</CardTitle>
            <Button size="sm" variant={'secondary'} onClick={_ => formDispatcher({type: 'goToActivityForm'})}>Edit</Button>
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
                <Button variant="outline" className="justify-between pr-1" onClick={() => { formDispatcher({ type: 'goToMetric', payload: { idx } }) }}>
                  <span>
                    {m.label}
                  </span>
                  <div className="flex gap-2 items-center">
                    <span className="text-muted-foreground">
                      {m.type === 'numeric' ? 'Numeric' : m.qualitativeLabels.join(', ')}
                    </span>
                    <Button size="icon-xs" variant={"destructive"} onClick={e => {
                      e.stopPropagation();
                      formDispatcher({ type: 'removeMetric', payload: { idx } })
                    }}>
                      <Trash2Icon className="size-4" />
                    </Button>
                  </div>
                </Button>
              ))}
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch md:flex-row gap-2 justify-stretch">
          <Button variant="outline" onClick={_ => formDispatcher({ type: 'goToAddNewMetric' })}>Add new Metric</Button>
          <Button className="md:flex-1">Create Activity</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
