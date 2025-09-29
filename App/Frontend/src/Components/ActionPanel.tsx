import { FileText, Users, Handshake, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

const actionItems = [
  {
    title: "Event Form",
    description: "Create and manage event registration forms",
    icon: FileText,
    color: "bg-college-blue/10 text-college-blue",
    borderColor: "border-college-blue/20",
    hoverColor: "hover:bg-college-blue/20",
  },
  {
    title: "Create Team",
    description: "Set up organizing teams for events",
    icon: Users,
    color: "bg-college-yellow/20 text-college-blue",
    borderColor: "border-college-yellow/30",
    hoverColor: "hover:bg-college-yellow/30",
  },
  {
    title: "Invite Sponsor",
    description: "Manage sponsors and partnerships",
    icon: Handshake,
    color: "bg-college-red/10 text-college-red",
    borderColor: "border-college-red/20",
    hoverColor: "hover:bg-college-red/20",
  },
];

export function ActionPanel() {
  const navigate = useNavigate();

  const handleActionClick = (title: string) => {
    switch (title) {
      case "Create Team":
        navigate("/create-team");
        break;
      case "Event Form":
        navigate("/event-form");
        break;
      case "Invite Sponsor":
        // TODO: Navigate to sponsor page
        console.log("Navigate to Invite Sponsor");
        break;
      default:
        break;
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Triangular design element */}
      <div className="relative">
        <div className="absolute -top-2 -right-2 w-0 h-0 border-l-[20px] border-l-transparent border-b-[20px] border-b-college-yellow opacity-40"></div>
        
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-college-blue">Quick Actions</h2>
          <Button 
            size="sm" 
            variant="outline" 
            className="text-xs bg-college-yellow/20 border-college-yellow text-college-blue hover:bg-college-yellow/30"
          >
            <Plus className="h-4 w-4 mr-1" />
            More
          </Button>
        </div>
      </div>
      
      <div className="space-y-3">
        {actionItems.map((item, index) => (
          <Card 
            key={item.title} 
            className={`cursor-pointer transition-all duration-200 ${item.hoverColor} border ${item.borderColor} relative overflow-hidden`}
            onClick={() => handleActionClick(item.title)}
          >
            {/* Small triangular accent */}
            <div className={`absolute top-0 right-0 w-0 h-0 border-l-[15px] border-l-transparent border-t-[15px] ${
              index === 0 ? 'border-t-college-blue' : 
              index === 1 ? 'border-t-college-yellow' : 
              'border-t-college-red'
            } opacity-30`}></div>
            
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${item.color}`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm mb-1 text-college-blue">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}