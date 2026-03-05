import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function ExportAnalytics() {
  const [selectedFormat, setSelectedFormat] = useState<"csv" | "json">("csv");
  const [isExporting, setIsExporting] = useState(false);

  // Fetch export data
  const { data: conversationsCSV } = trpc.export.exportConversationsCSV.useQuery({
    format: selectedFormat,
  });
  const { data: analyticsSummary } = trpc.export.exportAnalyticsSummary.useQuery({
    format: selectedFormat,
  });
  const { data: exportHistory } = trpc.export.getExportHistory.useQuery();

  const handleDownload = (data: string, filename: string, mimeType: string) => {
    setIsExporting(true);
    try {
      const element = document.createElement("a");
      const file = new Blob([data], { type: mimeType });
      element.href = URL.createObjectURL(file);
      element.download = filename;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">বিশ্লেষণ রপ্তানি / Export Analytics</h1>

      <Tabs defaultValue="conversations" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="conversations">কথোপকথন / Conversations</TabsTrigger>
          <TabsTrigger value="summary">সারসংক্ষেপ / Summary</TabsTrigger>
          <TabsTrigger value="history">ইতিহাস / History</TabsTrigger>
        </TabsList>

        {/* Conversations Export */}
        <TabsContent value="conversations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>কথোপকথন রপ্তানি করুন / Export Conversations</CardTitle>
              <CardDescription>আপনার সমস্ত কথোপকথন ডেটা ডাউনলোড করুন</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">ফরম্যাট নির্বাচন করুন / Select Format</label>
                <div className="flex gap-2 mb-4">
                  <Button
                    variant={selectedFormat === "csv" ? "default" : "outline"}
                    onClick={() => setSelectedFormat("csv")}
                  >
                    CSV
                  </Button>
                  <Button
                    variant={selectedFormat === "json" ? "default" : "outline"}
                    onClick={() => setSelectedFormat("json")}
                  >
                    JSON
                  </Button>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">প্রিভিউ / Preview</p>
                <pre className="text-xs overflow-auto max-h-40 bg-white p-2 rounded border">
                  {conversationsCSV?.data?.substring(0, 500)}...
                </pre>
              </div>

              <Button
                onClick={() =>
                  conversationsCSV &&
                  handleDownload(
                    conversationsCSV.data,
                    conversationsCSV.filename,
                    conversationsCSV.mimeType
                  )
                }
                disabled={isExporting}
                className="w-full"
              >
                {isExporting ? "ডাউনলোড করছে..." : "ডাউনলোড করুন / Download"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Summary Export */}
        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>বিশ্লেষণ সারসংক্ষেপ / Analytics Summary</CardTitle>
              <CardDescription>আপনার কথোপকথন পরিসংখ্যানের সারসংক্ষেপ ডাউনলোড করুন</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">ফরম্যাট নির্বাচন করুন / Select Format</label>
                <div className="flex gap-2 mb-4">
                  <Button
                    variant={selectedFormat === "csv" ? "default" : "outline"}
                    onClick={() => setSelectedFormat("csv")}
                  >
                    CSV
                  </Button>
                  <Button
                    variant={selectedFormat === "json" ? "default" : "outline"}
                    onClick={() => setSelectedFormat("json")}
                  >
                    JSON
                  </Button>

                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">মোট কথোপকথন / Total Conversations</p>
                  <p className="text-2xl font-bold">24</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">মোট বার্তা / Total Messages</p>
                  <p className="text-2xl font-bold">342</p>
                </div>
              </div>

              <Button
                onClick={() =>
                  analyticsSummary &&
                  handleDownload(
                    analyticsSummary.data,
                    analyticsSummary.filename,
                    analyticsSummary.mimeType
                  )
                }
                disabled={isExporting}
                className="w-full"
              >
                {isExporting ? "ডাউনলোড করছে..." : "ডাউনলোড করুন / Download"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Export History */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>রপ্তানি ইতিহাস / Export History</CardTitle>
              <CardDescription>আপনার পূর্ববর্তী রপ্তানিগুলি দেখুন এবং পুনরায় ডাউনলোড করুন</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {exportHistory?.exports?.map((exp: any) => (
                  <div key={exp.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{exp.filename}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(exp.createdAt).toLocaleDateString("bn-BD")} • {exp.size}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{exp.format.toUpperCase()}</Badge>
                      <Button size="sm" variant="outline">
                        পুনরায় ডাউনলোড / Re-download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
