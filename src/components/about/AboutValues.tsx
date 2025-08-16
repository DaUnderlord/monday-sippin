'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Shield, Heart, Zap, Users, Eye, BookOpen } from 'lucide-react'

export function AboutValues() {
  const values = [
    {
      icon: Shield,
      title: "Transparency",
      description: "We believe in complete honesty about market conditions, risks, and opportunities. No hidden agendas, just clear facts.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Heart,
      title: "Community First",
      description: "Our readers are at the heart of everything we do. We create content that serves your needs and answers your questions.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "We stay ahead of the curve, exploring new technologies and trends to bring you cutting-edge insights.",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: Users,
      title: "Accessibility",
      description: "Complex crypto concepts made simple. We break down barriers to make blockchain technology understandable for everyone.",
      color: "from-green-500 to-teal-500"
    },
    {
      icon: Eye,
      title: "Accuracy",
      description: "Every piece of information is thoroughly researched and fact-checked. We take responsibility for the quality of our content.",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: BookOpen,
      title: "Education",
      description: "Knowledge empowers better decisions. We're committed to being your trusted educational resource in the crypto space.",
      color: "from-red-500 to-pink-500"
    }
  ]

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Our Core Values
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            These principles guide every decision we make and every piece of content we create. 
            They're not just words on a page—they're our commitment to you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {values.map((value, index) => {
            const Icon = value.icon
            return (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="group"
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white">
                  <CardContent className="p-8 text-center">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r ${value.color} mb-6`}
                    >
                      <Icon className="w-10 h-10 text-white" />
                    </motion.div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {value.title}
                    </h3>
                    
                    <p className="text-gray-600 leading-relaxed">
                      {value.description}
                    </p>
                    
                    <div className={`w-16 h-1 bg-gradient-to-r ${value.color} rounded-full mx-auto mt-6 group-hover:w-24 transition-all duration-300`}></div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Values in action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-12 text-white">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold mb-4">Values in Action</h3>
              <p className="text-gray-300 text-lg">
                See how our values translate into real benefits for our community
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400 mb-2">100%</div>
                <div className="text-gray-300">Transparent Reporting</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400 mb-2">24h</div>
                <div className="text-gray-300">Community Response</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-2">Zero</div>
                <div className="text-gray-300">Hidden Fees</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400 mb-2">∞</div>
                <div className="text-gray-300">Learning Opportunities</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}