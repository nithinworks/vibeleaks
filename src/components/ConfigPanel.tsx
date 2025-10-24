import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as TOML from "@iarna/toml";
import type { TOMLConfig } from "@/types/scanner";

interface ConfigPanelProps {
  onConfigLoad: (config: TOMLConfig) => void;
  currentConfig?: TOMLConfig;
}

export const ConfigPanel = ({ onConfigLoad, currentConfig }: ConfigPanelProps) => {
  const [tomlContent, setTomlContent] = useState("");
  const { toast } = useToast();

  const handleLoadConfig = () => {
    try {
      const parsed = TOML.parse(tomlContent) as any;
      const config: TOMLConfig = {
        rules: parsed.rules || [],
        allowlist: parsed.allowlist || {},
      };
      
      onConfigLoad(config);
      
      toast({
        title: "Configuration loaded",
        description: `${config.rules?.length || 0} rule(s) loaded`,
      });
    } catch (error: any) {
      toast({
        title: "Invalid TOML",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      setTomlContent(content);
      
      toast({
        title: "File loaded",
        description: "TOML configuration file loaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error loading file",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const loadDefaultConfig = () => {
    const defaultConfig = `[[rules]]
id = "generic-api-key"
description = "Generic API Key"
regex = '''(?i)(api[_-]?key|apikey)[\\s]*[=:][\\s]*['"]?[a-zA-Z0-9_\\-]{20,}['"]?'''

[[rules]]
id = "aws-access-key"
description = "AWS Access Key ID"
regex = '''AKIA[0-9A-Z]{16}'''

[[rules]]
id = "github-token"
description = "GitHub Personal Access Token"
regex = '''ghp_[0-9a-zA-Z]{36}'''

[[rules]]
id = "private-key"
description = "Private Key"
regex = '''-----BEGIN (RSA |EC |DSA )?PRIVATE KEY-----'''

[[rules]]
id = "password-in-url"
description = "Password in URL"
regex = '''[a-zA-Z0-9]+://[^:]+:([^@]+)@'''

[allowlist]
regexes = []
paths = ["node_modules", ".git", "dist", "build"]`;

    setTomlContent(defaultConfig);
    toast({
      title: "Default config loaded",
      description: "Sample TOML configuration loaded into editor",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Rule Configuration
        </CardTitle>
        <CardDescription>
          Load TOML-based scanning rules and allowlists
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentConfig && (
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary">
              {currentConfig.rules?.length || 0} rules
            </Badge>
            <Badge variant="secondary">
              {currentConfig.allowlist?.paths?.length || 0} allowed paths
            </Badge>
            <Badge variant="secondary">
              {currentConfig.allowlist?.regexes?.length || 0} allowed patterns
            </Badge>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="toml-input">TOML Configuration</Label>
          <Textarea
            id="toml-input"
            value={tomlContent}
            onChange={(e) => setTomlContent(e.target.value)}
            placeholder="Paste TOML config or upload a file..."
            className="font-mono text-sm h-64"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleLoadConfig} disabled={!tomlContent}>
            Load Configuration
          </Button>
          
          <Button onClick={loadDefaultConfig} variant="outline">
            Load Default Rules
          </Button>

          <Button variant="outline" asChild>
            <label className="cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              Upload TOML File
              <input
                type="file"
                accept=".toml"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
