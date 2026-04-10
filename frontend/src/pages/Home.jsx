import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Activity,
  Brain,
  TrendingUp,
  Shield,
  ArrowRight,
  CheckCircle,
  Zap,
  Award,
  Sparkles,
  HeartPulse,
  Scan,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import ParticleBackground from "../components/common/ParticleBackground";
import AnimatedCounter from "../components/common/AnimatedCounter";
import GlassCard from "../components/common/GlassCard";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

/* ── Typewriter Hook ── */
const useTypewriter = (words, typingSpeed = 100, deletingSpeed = 60, pause = 2000) => {
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex];
    let timer;

    if (!isDeleting && text === currentWord) {
      timer = setTimeout(() => setIsDeleting(true), pause);
    } else if (isDeleting && text === "") {
      setIsDeleting(false);
      setWordIndex((prev) => (prev + 1) % words.length);
    } else {
      timer = setTimeout(
        () => {
          setText(
            isDeleting
              ? currentWord.substring(0, text.length - 1)
              : currentWord.substring(0, text.length + 1)
          );
        },
        isDeleting ? deletingSpeed : typingSpeed
      );
    }

    return () => clearTimeout(timer);
  }, [text, isDeleting, wordIndex, words, typingSpeed, deletingSpeed, pause]);

  return text;
};

const Home = () => {
  const { user } = useAuth();
  const typedText = useTypewriter(
    ["Predicted by AI", "Monitored in Real-Time", "Protected Always"],
    80,
    50,
    2200
  );

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Powered Diagnosis",
      description:
        "Advanced machine learning algorithms predict diseases based on your symptoms with high accuracy",
      color: "from-accent to-accent-600",
      glow: "accent",
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Risk Assessment",
      description:
        "Real-time mortality risk calculation based on vital signs and health indicators",
      color: "from-neon-green to-emerald-600",
      glow: "green",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Early Detection",
      description:
        "Identify potential health issues early for better treatment outcomes and prevention",
      color: "from-neon-purple to-violet-600",
      glow: "purple",
    },
    {
      icon: <HeartPulse className="w-8 h-8" />,
      title: "Health Dashboard",
      description:
        "Track your health trends with interactive visualizations and comprehensive analytics",
      color: "from-neon-pink to-rose-600",
      glow: "danger",
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
      icon: <Scan className="w-7 h-7" />,
      value: 10,
      suffix: "+",
      label: "Diseases Detected",
      color: "from-accent to-neon-cyan",
    },
    {
      icon: <Zap className="w-7 h-7" />,
      value: 95,
      suffix: "%",
      label: "Accuracy Rate",
      color: "from-neon-green to-emerald-500",
    },
    {
      icon: <Award className="w-7 h-7" />,
      value: "24/7",
      label: "Available",
      color: "from-neon-purple to-neon-pink",
    },
  ];

  const steps = [
    {
      num: "01",
      title: "Enter Symptoms",
      desc: "Describe your symptoms and vital signs",
      icon: <Activity className="w-6 h-6" />,
    },
    {
      num: "02",
      title: "AI Analysis",
      desc: "Our AI processes your health data in seconds",
      icon: <Brain className="w-6 h-6" />,
    },
    {
      num: "03",
      title: "Get Results",
      desc: "Receive personalized insights and recommendations",
      icon: <Sparkles className="w-6 h-6" />,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden py-20 sm:py-28 lg:py-36">
        <ParticleBackground particleCount={60} />

        {/* Ambient glow blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-cyan/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {/* Badge */}
            <motion.div variants={item} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent-300 text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                AI-Powered Health Intelligence
              </span>
            </motion.div>

            {/* Headline with typewriter */}
            <motion.h1
              variants={item}
              className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight"
            >
              Your Health,{" "}
              <span className="gradient-text">
                {typedText}
                <span className="animate-pulse text-accent-300">|</span>
              </span>
            </motion.h1>

            {/* Sub-headline */}
            <motion.p
              variants={item}
              className="text-lg sm:text-xl text-slate-400 mb-10 max-w-3xl mx-auto leading-relaxed"
            >
              Leverage advanced AI technology for early disease detection, risk
              assessment, and personalized health insights. Take control of your
              health today.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={item}
              className="flex flex-col sm:flex-row justify-center gap-4"
            >
              {user ? (
                <>
                  <Link to="/dashboard" className="btn-primary px-8 py-3.5 text-base inline-flex items-center justify-center">
                    Go to Dashboard
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                  <Link to="/predict" className="btn-neon px-8 py-3.5 text-base inline-flex items-center justify-center">
                    New Health Check
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register" className="btn-primary px-8 py-3.5 text-base inline-flex items-center justify-center">
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                  <Link to="/login" className="btn-secondary px-8 py-3.5 text-base inline-flex items-center justify-center">
                    Login
                  </Link>
                </>
              )}
            </motion.div>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {stats.map((stat, index) => (
              <motion.div key={index} variants={item}>
                <GlassCard className="p-6 text-center" delay={index * 0.1}>
                  <div
                    className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} mb-4 shadow-lg`}
                  >
                    <span className="text-white">{stat.icon}</span>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {typeof stat.value === "number" ? (
                      <AnimatedCounter end={stat.value} suffix={stat.suffix || ""} />
                    ) : (
                      stat.value
                    )}
                  </div>
                  <div className="text-slate-400 text-sm">{stat.label}</div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section className="py-20 sm:py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-surface via-surface-50/50 to-surface pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="section-heading">
              Powerful Features for{" "}
              <span className="gradient-text-cool">Better Health</span>
            </h2>
            <p className="section-subheading">
              Our AI-powered platform provides comprehensive health analysis and
              predictions
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <GlassCard
                key={index}
                className="p-6 group"
                delay={index * 0.1}
                glowColor={feature.glow}
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits Section ── */}
      <section className="py-20 sm:py-28 relative">
        <div className="absolute top-1/2 left-0 w-72 h-72 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="section-heading mb-6">
                Why Choose{" "}
                <span className="gradient-text-warm">HealthMateAI</span>?
              </h2>
              <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                Our platform combines cutting-edge AI technology with medical
                expertise to provide you with accurate health predictions and
                actionable insights.
              </p>
              <div className="space-y-3">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-center space-x-3 glass-card px-4 py-3"
                  >
                    <CheckCircle className="w-5 h-5 text-neon-green flex-shrink-0" />
                    <span className="text-slate-300 text-sm font-medium">
                      {benefit}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <GlassCard className="p-8">
                <div className="aspect-square bg-gradient-to-br from-accent/20 via-neon-cyan/10 to-neon-green/10 rounded-2xl flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-surface/50 to-transparent" />
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Activity className="w-28 h-28 text-accent-300" />
                  </motion.div>
                </div>
                <div className="mt-6 text-center">
                  <h3 className="text-xl font-bold text-white mb-2">
                    Real-Time Analysis
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Get instant health insights powered by AI
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      {!user && (
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-neon-cyan/5 to-accent/10" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Ready to Take Control of Your Health?
              </h2>
              <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
                Join users who trust HealthMateAI for their health monitoring and
                predictions
              </p>
              <Link
                to="/register"
                className="btn-primary px-10 py-4 text-lg inline-flex items-center"
              >
                Get Started Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* ── How It Works ── */}
      <section className="py-20 sm:py-28 relative">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="section-heading">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="section-subheading">
              Get your health prediction in three simple steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-[16%] right-[16%] h-px bg-gradient-to-r from-accent/30 via-neon-cyan/30 to-neon-green/30 -translate-y-1/2" />

            {steps.map((step, index) => (
              <motion.div
                key={index}
                className="text-center relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
              >
                <GlassCard className="p-8 relative" delay={index * 0.15}>
                  <div className="text-xs font-bold text-accent-400 tracking-widest mb-3 uppercase">
                    Step {step.num}
                  </div>
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-accent/20 to-neon-cyan/10 flex items-center justify-center mb-4 text-accent-300 border border-accent/20">
                    {step.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-slate-400 text-sm">{step.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
