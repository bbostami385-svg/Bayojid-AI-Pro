/**
 * উন্নত বিশ্লেষণ সিস্টেম
 * ব্যবহারকারী আচরণ, কথোপকথন মেট্রিক্স এবং রাজস্ব ট্র্যাকিং
 */

export interface UserBehavior {
  userId: string;
  totalSessions: number;
  totalSessionDuration: number; // মিনিটে
  averageSessionDuration: number;
  lastActiveAt: Date;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  browser: string;
  operatingSystem: string;
}

export interface ConversationMetrics {
  conversationId: string;
  userId: string;
  totalMessages: number;
  userMessages: number;
  aiMessages: number;
  averageResponseTime: number; // মিলিসেকেন্ডে
  sentimentAnalysis: {
    positive: number;
    neutral: number;
    negative: number;
  };
  topicsDiscussed: string[];
  duration: number; // মিনিটে
}

export interface RevenueMetrics {
  date: Date;
  totalRevenue: number;
  totalTransactions: number;
  averageTransactionValue: number;
  paymentGatewayBreakdown: Record<string, number>;
  subscriptionBreakdown: Record<string, number>;
  churnRate: number;
  retentionRate: number;
}

export interface UserEngagementMetrics {
  userId: string;
  engagementScore: number; // 0-100
  conversationFrequency: number; // প্রতি সপ্তাহে কথোপকথন
  averageConversationLength: number;
  subscriptionTier: 'free' | 'pro' | 'premium';
  lastConversationAt: Date;
  totalConversations: number;
  totalMessagesExchanged: number;
}

/**
 * ব্যবহারকারী আচরণ বিশ্লেষণ
 */
export class UserBehaviorAnalyzer {
  /**
   * ব্যবহারকারীর সেশন ট্র্যাক করুন
   */
  static trackSession(userId: string, duration: number, metadata: any): UserBehavior {
    return {
      userId,
      totalSessions: metadata.totalSessions || 1,
      totalSessionDuration: metadata.totalSessionDuration || duration,
      averageSessionDuration: (metadata.totalSessionDuration || duration) / (metadata.totalSessions || 1),
      lastActiveAt: new Date(),
      deviceType: metadata.deviceType || 'desktop',
      browser: metadata.browser || 'Unknown',
      operatingSystem: metadata.operatingSystem || 'Unknown'
    };
  }

  /**
   * ব্যবহারকারীর এনগেজমেন্ট স্কোর গণনা করুন
   */
  static calculateEngagementScore(behavior: UserBehavior, conversations: ConversationMetrics[]): number {
    let score = 0;

    // সেশন ফ্রিকোয়েন্সি (০-৩০ পয়েন্ট)
    if (behavior.totalSessions > 10) score += 30;
    else if (behavior.totalSessions > 5) score += 20;
    else if (behavior.totalSessions > 1) score += 10;

    // সেশন ডিউরেশন (০-২০ পয়েন্ট)
    if (behavior.averageSessionDuration > 30) score += 20;
    else if (behavior.averageSessionDuration > 15) score += 10;
    else if (behavior.averageSessionDuration > 5) score += 5;

    // কথোপকথন সংখ্যা (০-২০ পয়েন্ট)
    if (conversations.length > 20) score += 20;
    else if (conversations.length > 10) score += 15;
    else if (conversations.length > 5) score += 10;

    // সাম্প্রতিক কার্যকলাপ (০-৩০ পয়েন্ট)
    const daysSinceActive = Math.floor((Date.now() - behavior.lastActiveAt.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceActive === 0) score += 30;
    else if (daysSinceActive <= 7) score += 20;
    else if (daysSinceActive <= 30) score += 10;

    return Math.min(score, 100);
  }
}

/**
 * কথোপকথন মেট্রিক্স বিশ্লেষণ
 */
export class ConversationAnalyzer {
  /**
   * কথোপকথন মেট্রিক্স গণনা করুন
   */
  static analyzeConversation(messages: any[]): ConversationMetrics {
    const userMessages = messages.filter(m => m.role === 'user');
    const aiMessages = messages.filter(m => m.role === 'assistant');

    // গড় প্রতিক্রিয়া সময় গণনা করুন
    let totalResponseTime = 0;
    for (let i = 0; i < aiMessages.length; i++) {
      if (i < userMessages.length) {
        totalResponseTime += aiMessages[i].timestamp - userMessages[i].timestamp;
      }
    }
    const averageResponseTime = aiMessages.length > 0 ? totalResponseTime / aiMessages.length : 0;

    // সেন্টিমেন্ট বিশ্লেষণ (সরলীকৃত)
    const sentimentAnalysis = {
      positive: 0,
      neutral: 0,
      negative: 0
    };

    userMessages.forEach(msg => {
      const text = msg.content.toLowerCase();
      if (text.includes('ধন্যবাদ') || text.includes('দুর্দান্ত') || text.includes('চমৎকার')) {
        sentimentAnalysis.positive++;
      } else if (text.includes('সমস্যা') || text.includes('খারাপ') || text.includes('ভুল')) {
        sentimentAnalysis.negative++;
      } else {
        sentimentAnalysis.neutral++;
      }
    });

    // বিষয় নির্ধারণ (সরলীকৃত)
    const topicsDiscussed: string[] = [];
    userMessages.forEach(msg => {
      const text = msg.content.toLowerCase();
      if (text.includes('পেমেন্ট') || text.includes('বিল')) topicsDiscussed.push('Payment');
      if (text.includes('সাহায্য') || text.includes('সমস্যা')) topicsDiscussed.push('Support');
      if (text.includes('বৈশিষ্ট্য') || text.includes('কীভাবে')) topicsDiscussed.push('Features');
    });

    return {
      conversationId: `conv_${Date.now()}`,
      userId: '',
      totalMessages: messages.length,
      userMessages: userMessages.length,
      aiMessages: aiMessages.length,
      averageResponseTime,
      sentimentAnalysis,
      topicsDiscussed: Array.from(new Set(topicsDiscussed)),
      duration: 0
    };
  }

  /**
   * কথোপকথনের গুণমান স্কোর করুন
   */
  static scoreConversationQuality(metrics: ConversationMetrics): number {
    let score = 0;

    // বার্তার সংখ্যা (০-২০)
    if (metrics.totalMessages > 20) score += 20;
    else if (metrics.totalMessages > 10) score += 15;
    else if (metrics.totalMessages > 5) score += 10;

    // ভারসাম্য (০-২০)
    const balance = Math.min(metrics.userMessages, metrics.aiMessages) / Math.max(metrics.userMessages, metrics.aiMessages);
    if (balance > 0.8) score += 20;
    else if (balance > 0.6) score += 15;
    else if (balance > 0.4) score += 10;

    // প্রতিক্রিয়া সময় (০-২০)
    if (metrics.averageResponseTime < 500) score += 20;
    else if (metrics.averageResponseTime < 1000) score += 15;
    else if (metrics.averageResponseTime < 2000) score += 10;

    // সেন্টিমেন্ট (০-২০)
    if (metrics.sentimentAnalysis.positive > metrics.sentimentAnalysis.negative) score += 20;
    else if (metrics.sentimentAnalysis.positive === metrics.sentimentAnalysis.negative) score += 10;

    // বিষয় বৈচিত্র্য (০-২০)
    if (metrics.topicsDiscussed.length > 3) score += 20;
    else if (metrics.topicsDiscussed.length > 1) score += 10;

    return Math.min(score, 100);
  }
}

/**
 * রাজস্ব বিশ্লেষণ
 */
export class RevenueAnalyzer {
  /**
   * দৈনিক রাজস্ব মেট্রিক্স গণনা করুন
   */
  static calculateDailyRevenue(transactions: any[]): RevenueMetrics {
    const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
    const averageTransactionValue = transactions.length > 0 ? totalRevenue / transactions.length : 0;

    // পেমেন্ট গেটওয়ে ব্রেকডাউন
    const paymentGatewayBreakdown: Record<string, number> = {};
    transactions.forEach(t => {
      paymentGatewayBreakdown[t.gateway] = (paymentGatewayBreakdown[t.gateway] || 0) + t.amount;
    });

    // সাবস্ক্রিপশন ব্রেকডাউন
    const subscriptionBreakdown: Record<string, number> = {
      free: 0,
      pro: 0,
      premium: 0
    };

    return {
      date: new Date(),
      totalRevenue,
      totalTransactions: transactions.length,
      averageTransactionValue,
      paymentGatewayBreakdown,
      subscriptionBreakdown,
      churnRate: 0,
      retentionRate: 0
    };
  }

  /**
   * চার্ন রেট গণনা করুন
   */
  static calculateChurnRate(previousUsers: number, currentUsers: number): number {
    if (previousUsers === 0) return 0;
    return ((previousUsers - currentUsers) / previousUsers) * 100;
  }

  /**
   * রিটেনশন রেট গণনা করুন
   */
  static calculateRetentionRate(previousUsers: number, currentUsers: number): number {
    if (previousUsers === 0) return 0;
    return ((currentUsers / previousUsers) * 100);
  }

  /**
   * রাজস্ব পূর্বাভাস
   */
  static forecastRevenue(historicalData: RevenueMetrics[], days: number): number[] {
    const forecast: number[] = [];
    const avgRevenue = historicalData.reduce((sum, d) => sum + d.totalRevenue, 0) / historicalData.length;
    const trend = (historicalData[historicalData.length - 1].totalRevenue - historicalData[0].totalRevenue) / historicalData.length;

    for (let i = 1; i <= days; i++) {
      forecast.push(avgRevenue + (trend * i));
    }

    return forecast;
  }
}

/**
 * ব্যবহারকারী এনগেজমেন্ট বিশ্লেষণ
 */
export class UserEngagementAnalyzer {
  /**
   * ব্যবহারকারী এনগেজমেন্ট মেট্রিক্স গণনা করুন
   */
  static calculateEngagementMetrics(
    userId: string,
    conversations: ConversationMetrics[],
    subscriptionTier: 'free' | 'pro' | 'premium'
  ): UserEngagementMetrics {
    const totalMessages = conversations.reduce((sum, c) => sum + c.totalMessages, 0);
    const averageConversationLength = conversations.length > 0 ? totalMessages / conversations.length : 0;
    const conversationFrequency = conversations.length; // সরলীকৃত

    // এনগেজমেন্ট স্কোর গণনা করুন
    let engagementScore = 0;

    if (conversations.length > 10) engagementScore += 30;
    else if (conversations.length > 5) engagementScore += 20;
    else if (conversations.length > 0) engagementScore += 10;

    if (averageConversationLength > 20) engagementScore += 30;
    else if (averageConversationLength > 10) engagementScore += 20;
    else if (averageConversationLength > 5) engagementScore += 10;

    if (subscriptionTier === 'premium') engagementScore += 20;
    else if (subscriptionTier === 'pro') engagementScore += 10;

    return {
      userId,
      engagementScore: Math.min(engagementScore, 100),
      conversationFrequency,
      averageConversationLength,
      subscriptionTier,
      lastConversationAt: conversations.length > 0 ? new Date() : new Date(0),
      totalConversations: conversations.length,
      totalMessagesExchanged: totalMessages
    };
  }

  /**
   * ব্যবহারকারী সেগমেন্টেশন
   */
  static segmentUsers(users: UserEngagementMetrics[]): Record<string, UserEngagementMetrics[]> {
    const segments: Record<string, UserEngagementMetrics[]> = {
      highEngagement: [],
      mediumEngagement: [],
      lowEngagement: [],
      inactive: []
    };

    users.forEach(user => {
      if (user.engagementScore >= 70) {
        segments.highEngagement.push(user);
      } else if (user.engagementScore >= 40) {
        segments.mediumEngagement.push(user);
      } else if (user.engagementScore > 0) {
        segments.lowEngagement.push(user);
      } else {
        segments.inactive.push(user);
      }
    });

    return segments;
  }
}

/**
 * রিপোর্ট জেনারেটর
 */
export class AnalyticsReportGenerator {
  /**
   * সাপ্তাহিক রিপোর্ট তৈরি করুন
   */
  static generateWeeklyReport(data: {
    users: UserEngagementMetrics[];
    revenue: RevenueMetrics[];
    conversations: ConversationMetrics[];
  }): string {
    const totalUsers = data.users.length;
    const activeUsers = data.users.filter(u => u.engagementScore > 0).length;
    const totalRevenue = data.revenue.reduce((sum, r) => sum + r.totalRevenue, 0);
    const avgEngagement = data.users.reduce((sum, u) => sum + u.engagementScore, 0) / totalUsers;

    return `
সাপ্তাহিক বিশ্লেষণ রিপোর্ট
========================

মোট ব্যবহারকারী: ${totalUsers}
সক্রিয় ব্যবহারকারী: ${activeUsers}
মোট রাজস্ব: ৳${totalRevenue.toLocaleString()}
গড় এনগেজমেন্ট স্কোর: ${avgEngagement.toFixed(2)}/100

শীর্ষ এনগেজড ব্যবহারকারী:
${data.users.sort((a, b) => b.engagementScore - a.engagementScore).slice(0, 5).map(u => `- ${u.userId}: ${u.engagementScore}/100`).join('\n')}

সুপারিশ:
- নিম্ন এনগেজমেন্ট ব্যবহারকারীদের জন্য পুনরায় এনগেজমেন্ট ক্যাম্পেইন চালান
- প্রিমিয়াম বৈশিষ্ট্য প্রচার করুন উচ্চ এনগেজড ব্যবহারকারীদের কাছে
- রাজস্ব বৃদ্ধির জন্য নতুন পেমেন্ট গেটওয়ে যোগ করুন
    `;
  }
}
