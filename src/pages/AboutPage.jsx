import Navbar from "../components/Navbar";
import { Shield, Users, Heart, Award, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../components/LanguageContext";

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Story Section */}
        <section className="py-24 px-8 max-w-5xl mx-auto w-full text-center">
          <span className="text-[#22C55E] font-bold tracking-[0.2em] uppercase text-xs mb-6 block">
            {t("about", "tag")}
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8 tracking-tight leading-tight">
            {t("about", "title1")} <br className="hidden md:block" />
            <span className="text-gray-400">{t("about", "title2")}</span>
          </h1>
          <p className="text-xl text-gray-500 leading-relaxed max-w-3xl mx-auto">
            {t("about", "desc")}
          </p>
        </section>

        {/* Values Grid */}
        <section className="py-24 bg-gray-50 px-8">
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Shield,
                  title: t("about", "valTrust"),
                  description: t("about", "valTrustDesc"),
                },
                {
                  icon: Users,
                  title: t("about", "valComm"),
                  description: t("about", "valCommDesc"),
                },
                {
                  icon: Heart,
                  title: t("about", "valQuality"),
                  description: t("about", "valQualityDesc"),
                },
              ].map((value, i) => (
                <div
                  key={i}
                  className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-14 h-14 bg-[#22C55E]/10 rounded-2xl flex items-center justify-center text-[#22C55E] mb-8">
                    <value.icon size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {value.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Vision Section */}
        <section className="py-32 px-8">
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="aspect-square bg-gray-100 rounded-[3rem] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800"
                  alt="Team collaboration"
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                />
              </div>
              <div className="absolute -bottom-10 -right-10 bg-white p-8 rounded-[2rem] shadow-2xl border border-gray-100 hidden lg:block max-w-xs">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-[#22C55E] rounded-full flex items-center justify-center text-white">
                    <Award size={24} />
                  </div>
                  <span className="font-bold text-gray-900">
                    {t("about", "visionBadge")}
                  </span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {t("about", "visionBadgeDesc")}
                </p>
              </div>
            </div>
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-8 tracking-tight">
                {t("about", "visionTitle")}
              </h2>
              <p className="text-lg text-gray-500 mb-10 leading-relaxed">
                {t("about", "visionDesc")}
              </p>
              <ul className="space-y-6 mb-12">
                {[
                  t("about", "visionPoint1"),
                  t("about", "visionPoint2"),
                  t("about", "visionPoint3"),
                  t("about", "visionPoint4"),
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-4 text-gray-900 font-semibold group"
                  >
                    <div className="w-2 h-2 bg-[#22C55E] rounded-full group-hover:scale-150 transition-transform"></div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to="/signup"
                className="inline-flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-full font-bold hover:bg-[#22C55E] transition-all group shadow-xl"
              >
                {t("about", "visionBtn")}
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Basic Footer */}
      <footer className="py-12 border-t border-gray-100 bg-gray-50 px-8">
        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shadow-sm">
              <img
                src="/assets/logo.png"
                alt="Lingkod Hub Logo"
                className="w-[160%] h-[160%] max-w-none object-cover"
              />
            </div>
            <span className="font-bold text-gray-900">Lingkod Hub</span>
          </div>
          <p className="text-sm text-gray-400">{t("about", "footerText")}</p>
        </div>
      </footer>
    </div>
  );
}
