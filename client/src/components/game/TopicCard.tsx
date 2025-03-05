import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

export function TopicCard({ topic, questions }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="grid grid-cols-3 divide-x divide-y">
          {questions.map((question) => (
            <Link
              key={question.id}
              to={`/question/${question.id}`}
              className="flex items-center justify-center p-4 text-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              {question.points}
            </Link>
          ))}
        </div>
        <div className="flex items-center justify-center p-2 bg-primary text-primary-foreground font-semibold">
          {topic.icon} {topic.name}
        </div>
      </CardContent>
    </Card>
  );
}