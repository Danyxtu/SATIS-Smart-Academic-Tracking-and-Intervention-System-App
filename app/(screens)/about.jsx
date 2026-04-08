import AboutScreen from "@screens/about/index.jsx";

import {
  BookOpen,
  BarChart2,
  MessageSquare,
  CheckCircle,
  HelpCircle,
  Calendar,
  AlertTriangle,
} from "lucide-react-native";

const About = () => {
  const faqs = [
    {
      question: "How do I check my attendance?",
      answer:
        "Go to the Attendance section to view your complete attendance records. You can see daily records, monthly summaries, and your overall attendance rate. The system tracks present, absent, late, and excused statuses for each of your enrolled subjects.",
      icon: Calendar,
    },
    {
      question: "Where can I see my grades?",
      answer:
        "Navigate to the Performance Analytics section to view your grades and academic performance. You can see quarterly breakdowns, grade trends, and detailed analytics for each subject including written works, performance tasks, and quarterly assessments.",
      icon: BarChart2,
    },
    {
      question: "How do I contact my teacher?",
      answer:
        "Use the Intervention & Feedback section to view messages from your teachers. When your teacher starts an intervention, you'll receive notifications with their guidance and can view any tasks or goals they've assigned to help you succeed.",
      icon: MessageSquare,
    },
    {
      question: "What are intervention tasks?",
      answer:
        "Intervention tasks are personalized goals set by your teacher to help you improve. These might include completing specific assignments, attending extra help sessions, or following a study plan. Complete these tasks to show progress and get back on track!",
      icon: CheckCircle,
    },
    {
      question: "How is my grade calculated?",
      answer:
        "Your grade is calculated based on Written Works (20%), Performance Tasks (60%), and Quarterly Assessment (20%). Each component is weighted to give you a comprehensive evaluation of your academic performance.",
      icon: HelpCircle,
    },
  ];
  const features = [
    {
      title: "Dashboard",
      description:
        "View your academic overview including GPA, attendance rate, and important notifications.",
      icon: BookOpen,
      gradientColors: ["#6366F1", "#8B5CF6"],
      route: "/home",
    },
    {
      title: "Performance Analytics",
      description:
        "Deep dive into your grades with detailed charts and trends for each subject.",
      icon: BarChart2,
      gradientColors: ["#10B981", "#059669"],
      route: "/performance",
    },
    {
      title: "Intervention & Feedback",
      description:
        "Receive personalized support from your teachers and track your improvement journey.",
      icon: MessageSquare,
      gradientColors: ["#F59E0B", "#D97706"],
      route: "/intervention",
    },
    {
      title: "Subject at Risk",
      description:
        "Identify subjects that need attention and get recommendations to improve.",
      icon: AlertTriangle,
      gradientColors: ["#EF4444", "#DC2626"],
      route: "/subject",
    },
  ];

  const studyTips = [
    {
      number: 1,
      title: "Set a Study Schedule",
      description:
        "Create a consistent study routine. Study at the same time each day to build a habit.",
      bgColor: "#6366F1",
    },
    {
      number: 2,
      title: "Take Active Notes",
      description:
        "Don't just read - write summaries, create diagrams, and ask yourself questions.",
      bgColor: "#8B5CF6",
    },
    {
      number: 3,
      title: "Break It Down",
      description:
        "Large tasks feel overwhelming. Break them into smaller, manageable chunks.",
      bgColor: "#F59E0B",
    },
    {
      number: 4,
      title: "Ask For Help Early",
      description:
        "Struggling? Don't wait! Ask your teacher for help as soon as possible.",
      bgColor: "#10B981",
    },
  ];
  return <AboutScreen faqs={faqs} features={features} studyTips={studyTips} />;
};

export default About;
