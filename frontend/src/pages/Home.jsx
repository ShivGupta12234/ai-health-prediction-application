import { Link } from "react-router-dom";
import {
  Activity,
  Brain,
  TrendingUp,
  Shield,
  ArrowRight,
  CheckCircle,
  Zap,
  Users,
  Award,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: <Brain className="w-12 h-12 text-primary-500" />,
      title: "AI-Powered Diagnosis",
      description:
        "Advanced machine learning algorithms predict diseases based on your symptoms with high accuracy",
    },
    {
      icon: <TrendingUp className="w-12 h-12 text-secondary-500" />,
      title: "Risk Assessment",
      description:
        "Real-time mortality risk calculation based on vital signs and health indicators",
    },
    {
      icon: <Shield className="w-12 h-12 text-purple-500" />,
      title: "Early Detection",
      description:
        "Identify potential health issues early for better treatment outcomes and prevention",
    },
    {
      icon: <Activity className="w-12 h-12 text-orange-500" />,
      title: "Health Dashboard",
      description:
        "Track your health trends with interactive visualizations and comprehensive analytics",
    },
  ];

  const benefits = [
    "Instant disease predictions based on symptoms",
    "Personalized health recommendations",
    "Track your health history over time",
    "Early warning system for critical conditions",
    "Data-driven insights for better health decisions",
  ];

  const stats = [
    {
      icon: <Users className="w-8 h-8" />,
      value: "10+",
      label: "Diseases Detected",
    },
    { icon: <Zap className="w-8 h-8" />, value: "95%", label: "Accuracy Rate" },
    { icon: <Award className="w-8 h-8" />, value: "24/7", label: "Available" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-2 bg-primary-100 rounded-full mb-6 animate-pulse">
              <Activity className="w-16 h-16 text-primary-600" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              AI-Powered Health Prediction System
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Leverage advanced AI technology for early disease detection, risk
              assessment, and personalized health insights. Take control of your
              health today.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center justify-center bg-primary-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary-600 transition-colors shadow-lg hover:shadow-xl"
                  >
                    Go to Dashboard
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                  <Link
                    to="/predict"
                    className="inline-flex items-center justify-center bg-secondary-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-secondary-600 transition-colors shadow-lg hover:shadow-xl"
                  >
                    New Health Check
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center bg-primary-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary-600 transition-colors shadow-lg hover:shadow-xl"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center bg-white text-primary-500 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors border-2 border-primary-500 shadow-lg hover:shadow-xl"
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-lg text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4 text-primary-600">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Better Health
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our AI-powered platform provides comprehensive health analysis and
              predictions
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-50 p-6 rounded-xl hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary-200 transform hover:-translate-y-1"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Why Choose HealthAI?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Our platform combines cutting-edge AI technology with medical
                expertise to provide you with accurate health predictions and
                actionable insights.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 bg-white p-4 rounded-lg shadow-sm"
                  >
                    <CheckCircle className="w-6 h-6 text-secondary-500 flex-shrink-0 mt-1" />
                    <span className="text-gray-700 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-2xl">
              <div className="aspect-square bg-gradient-to-br from-primary-100 to-secondary-100 rounded-xl flex items-center justify-center">
                <Activity className="w-32 h-32 text-primary-500 animate-pulse" />
              </div>
              <div className="mt-6 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Real-Time Analysis
                </h3>
                <p className="text-gray-600">
                  Get instant health insights powered by AI
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {!user && (
        <div className="py-20 bg-gradient-to-r from-primary-600 to-primary-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Take Control of Your Health?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust HealthAI for their health
              monitoring and predictions
            </p>
            <Link
              to="/register"
              className="inline-flex items-center justify-center bg-white text-primary-600 px-10 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              Get Started Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Get your health prediction in three simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4 text-primary-600 font-bold text-2xl">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Enter Symptoms</h3>
              <p className="text-gray-600">
                Describe your symptoms and vital signs
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary-100 rounded-full mb-4 text-secondary-600 font-bold text-2xl">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Analysis</h3>
              <p className="text-gray-600">Our AI processes your health data</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4 text-purple-600 font-bold text-2xl">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Results</h3>
              <p className="text-gray-600">
                Receive personalized health insights
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
