import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  BookOpen,
  HelpCircle,
  Lightbulb,
  BarChart2,
  Calendar,
  MessageSquare,
  AlertTriangle,
  Mail,
  Phone,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Users,
  GraduationCap,
  PlayCircle,
} from "lucide-react-native";

// Tutorial Components
import TutorialCard from "../components/TutorialCard";
import TutorialOverlay from "../components/TutorialOverlay";
import { getTutorialCards, getTutorialById } from "../components/tutorialData";

// FAQ Accordion Item Component
const FAQItem = ({
  question,
  answer,
  icon: Icon,
  iconColor,
  isOpen,
  onPress,
}) => (
  <TouchableOpacity
    style={[styles.faqCard, isOpen && styles.faqCardOpen]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.faqHeader}>
      <View
        style={[
          styles.faqIconBox,
          { backgroundColor: isOpen ? "#EEF2FF" : "#F3F4F6" },
        ]}
      >
        <Icon color={isOpen ? "#6366F1" : "#6B7280"} size={18} />
      </View>
      <Text style={styles.faqQuestion}>{question}</Text>
      {isOpen ? (
        <ChevronUp color="#6B7280" size={20} />
      ) : (
        <ChevronDown color="#6B7280" size={20} />
      )}
    </View>
    {isOpen && (
      <View style={styles.faqAnswer}>
        <Text style={styles.faqAnswerText}>{answer}</Text>
      </View>
    )}
  </TouchableOpacity>
);

// Feature Card Component
const FeatureCard = ({
  title,
  description,
  icon: Icon,
  gradientColors,
  onPress,
}) => (
  <TouchableOpacity
    style={[styles.featureCard, { backgroundColor: gradientColors[0] }]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={styles.featureIconBox}>
      <Icon color="#FFF" size={24} />
    </View>
    <Text style={styles.featureTitle}>{title}</Text>
    <Text style={styles.featureDescription}>{description}</Text>
    {onPress && (
      <View style={styles.featureArrow}>
        <Text style={styles.featureArrowText}>View →</Text>
      </View>
    )}
  </TouchableOpacity>
);

// Study Tip Card Component
const TipCard = ({ number, title, description, bgColor }) => (
  <View style={[styles.tipCard, { backgroundColor: bgColor }]}>
    <View style={styles.tipBadge}>
      <Text style={styles.tipBadgeText}>Tip #{number}</Text>
    </View>
    <Text style={styles.tipTitle}>{title}</Text>
    <Text style={styles.tipDescription}>{description}</Text>
  </View>
);

// Contact Card Component
const ContactCard = ({ icon: Icon, title, subtitle, bgColor, onPress }) => (
  <TouchableOpacity
    style={styles.contactCard}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.contactIconBox, { backgroundColor: bgColor }]}>
      <Icon color="#FFF" size={22} />
    </View>
    <Text style={styles.contactTitle}>{title}</Text>
    <Text style={styles.contactSubtitle}>{subtitle}</Text>
  </TouchableOpacity>
);

const LearnMoreScreen = () => {
  const router = useRouter();
  const [openFAQ, setOpenFAQ] = useState(0);
  const [activeTutorial, setActiveTutorial] = useState(null);
  const [tutorialVisible, setTutorialVisible] = useState(false);

  // Get tutorial cards data
  const tutorialCards = getTutorialCards();

  // Handle tutorial card press
  const handleTutorialPress = (tutorialId) => {
    const tutorial = getTutorialById(tutorialId);
    if (tutorial) {
      setActiveTutorial(tutorial);
      setTutorialVisible(true);
    }
  };

  // Close tutorial overlay
  const handleCloseTutorial = () => {
    setTutorialVisible(false);
    setActiveTutorial(null);
  };

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

  const handleOpenEmail = () => {
    Linking.openURL("mailto:support@satis.edu");
  };

  const handleOpenPhone = () => {
    Linking.openURL("tel:123456789");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <View style={styles.backIconCircle}>
            <ArrowLeft color="#374151" size={20} />
          </View>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        {/* Hero Header */}
        <View style={styles.heroCard}>
          <View style={styles.heroIconBox}>
            <GraduationCap color="#FFF" size={28} />
          </View>
          <Text style={styles.heroTitle}>Learn More</Text>
          <Text style={styles.heroSubtitle}>
            Explore resources to help you succeed in your academic journey. Find
            answers to common questions and discover study tips.
          </Text>
        </View>

        {/* App Tutorials Section - NEW */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View
              style={[styles.sectionIconBox, { backgroundColor: "#FCE7F3" }]}
            >
              <PlayCircle color="#DB2777" size={18} />
            </View>
            <View>
              <Text style={styles.sectionTitle}>App Tutorials</Text>
              <Text style={styles.sectionSubtitle}>
                Step-by-step guides for each feature
              </Text>
            </View>
          </View>

          <View style={styles.tutorialGrid}>
            {tutorialCards.map((card) => (
              <TutorialCard
                key={card.id}
                title={card.title}
                description={card.description}
                icon={card.icon}
                color={card.color}
                stepCount={card.stepCount}
                onPress={() => handleTutorialPress(card.id)}
              />
            ))}
          </View>
        </View>

        {/* Platform Features Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View
              style={[styles.sectionIconBox, { backgroundColor: "#EEF2FF" }]}
            >
              <BookOpen color="#6366F1" size={18} />
            </View>
            <View>
              <Text style={styles.sectionTitle}>Platform Features</Text>
              <Text style={styles.sectionSubtitle}>
                Explore what SATIS offers
              </Text>
            </View>
          </View>

          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                {...feature}
                onPress={() => router.push(feature.route)}
              />
            ))}
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View
              style={[styles.sectionIconBox, { backgroundColor: "#FEF3C7" }]}
            >
              <HelpCircle color="#F59E0B" size={18} />
            </View>
            <View>
              <Text style={styles.sectionTitle}>
                Frequently Asked Questions
              </Text>
              <Text style={styles.sectionSubtitle}>
                Find answers to common questions
              </Text>
            </View>
          </View>

          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              {...faq}
              isOpen={openFAQ === index}
              onPress={() => setOpenFAQ(openFAQ === index ? -1 : index)}
            />
          ))}
        </View>

        {/* Study Tips Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View
              style={[styles.sectionIconBox, { backgroundColor: "#FEF3C7" }]}
            >
              <Lightbulb color="#F59E0B" size={18} />
            </View>
            <View>
              <Text style={styles.sectionTitle}>Study Tips</Text>
              <Text style={styles.sectionSubtitle}>
                Improve your learning habits
              </Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tipsScroll}
          >
            {studyTips.map((tip, index) => (
              <TipCard key={index} {...tip} />
            ))}
          </ScrollView>
        </View>

        {/* Understanding Progress Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View
              style={[styles.sectionIconBox, { backgroundColor: "#D1FAE5" }]}
            >
              <BarChart2 color="#10B981" size={18} />
            </View>
            <View>
              <Text style={styles.sectionTitle}>
                Understanding Your Progress
              </Text>
              <Text style={styles.sectionSubtitle}>What the colors mean</Text>
            </View>
          </View>

          <View style={styles.progressCard}>
            <View
              style={[
                styles.progressItem,
                { backgroundColor: "#D1FAE5", borderColor: "#A7F3D0" },
              ]}
            >
              <View style={styles.progressBadge}>
                <Text style={[styles.progressBadgeText, { color: "#059669" }]}>
                  On Track
                </Text>
              </View>
              <Text style={styles.progressTitle}>You're Doing Great!</Text>
              <Text style={styles.progressText}>
                Your grade is 75% or higher. Keep up the excellent work!
              </Text>
            </View>

            <View
              style={[
                styles.progressItem,
                { backgroundColor: "#FEF3C7", borderColor: "#FDE68A" },
              ]}
            >
              <View style={styles.progressBadge}>
                <Text style={[styles.progressBadgeText, { color: "#D97706" }]}>
                  Needs Attention
                </Text>
              </View>
              <Text style={styles.progressTitle}>Room for Improvement</Text>
              <Text style={styles.progressText}>
                Your grade is between 70-75%. Consider dedicating more time to
                this subject.
              </Text>
            </View>

            <View
              style={[
                styles.progressItem,
                { backgroundColor: "#FEE2E2", borderColor: "#FECACA" },
              ]}
            >
              <View style={styles.progressBadge}>
                <Text style={[styles.progressBadgeText, { color: "#DC2626" }]}>
                  At Risk
                </Text>
              </View>
              <Text style={styles.progressTitle}>
                Immediate Attention Required
              </Text>
              <Text style={styles.progressText}>
                Your grade is below 70%. Seek help from your teacher
                immediately.
              </Text>
            </View>
          </View>
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View
              style={[styles.sectionIconBox, { backgroundColor: "#DBEAFE" }]}
            >
              <Mail color="#3B82F6" size={18} />
            </View>
            <View>
              <Text style={styles.sectionTitle}>Contact & Resources</Text>
              <Text style={styles.sectionSubtitle}>
                Get help when you need it
              </Text>
            </View>
          </View>

          <View style={styles.contactGrid}>
            <ContactCard
              icon={Mail}
              title="Email Support"
              subtitle="support@satis.edu"
              bgColor="#F59E0B"
              onPress={handleOpenEmail}
            />
            <ContactCard
              icon={Phone}
              title="Call Us"
              subtitle="(123) 456-789"
              bgColor="#10B981"
              onPress={handleOpenPhone}
            />
            <ContactCard
              icon={MessageCircle}
              title="Send Message"
              subtitle="Contact Admin"
              bgColor="#8B5CF6"
              onPress={() => {}}
            />
          </View>
        </View>

        {/* Still Need Help Banner */}
        <View style={styles.helpBanner}>
          <View style={styles.helpIconCircle}>
            <Users color="#FFF" size={28} />
          </View>
          <Text style={styles.helpTitle}>Still Need Help?</Text>
          <Text style={styles.helpText}>
            Our support team is ready to assist you with any questions or
            concerns about your academic journey.
          </Text>
          <TouchableOpacity style={styles.helpButton} activeOpacity={0.8}>
            <Text style={styles.helpButtonText}>Contact Support Team</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Tutorial Overlay */}
      {activeTutorial && (
        <TutorialOverlay
          visible={tutorialVisible}
          onClose={handleCloseTutorial}
          steps={activeTutorial.steps}
          title={activeTutorial.title}
          accentColor={activeTutorial.color}
        />
      )}
    </SafeAreaView>
  );
};

export default LearnMoreScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFF7FB" },
  container: { flex: 1 },
  scrollContent: { padding: 16 },

  // Back Button
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  backText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },

  // Hero Card
  heroCard: {
    backgroundColor: "#DB2777",
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    alignItems: "center",
  },
  heroIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "#FBCFE8",
    textAlign: "center",
    lineHeight: 20,
  },

  // Section
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#6B7280",
  },

  // Feature Cards
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  // Tutorial Grid
  tutorialGrid: {
    gap: 12,
  },

  featureCard: {
    width: "48%",
    borderRadius: 16,
    padding: 16,
    minHeight: 140,
  },
  featureIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 16,
  },
  featureArrow: {
    marginTop: 10,
  },
  featureArrowText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFF",
  },

  // FAQ Cards
  faqCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  faqCardOpen: {
    borderColor: "#C7D2FE",
    shadowColor: "#6366F1",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  faqIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  faqAnswer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  faqAnswerText: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 20,
  },

  // Tip Cards
  tipsScroll: {
    paddingRight: 16,
  },
  tipCard: {
    width: 180,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
  },
  tipBadge: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  tipBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFF",
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 6,
  },
  tipDescription: {
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 16,
  },

  // Progress Cards
  progressCard: {
    gap: 10,
  },
  progressItem: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },
  progressBadge: {
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  progressBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  progressText: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },

  // Contact Cards
  contactGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  contactCard: {
    flex: 1,
    minWidth: "30%",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  contactIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  contactTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
    textAlign: "center",
  },
  contactSubtitle: {
    fontSize: 11,
    color: "#6B7280",
    textAlign: "center",
  },

  // Help Banner
  helpBanner: {
    backgroundColor: "#6366F1",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginTop: 8,
  },
  helpIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  helpTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: "#C7D2FE",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  helpButton: {
    backgroundColor: "#FFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  helpButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6366F1",
  },
});
