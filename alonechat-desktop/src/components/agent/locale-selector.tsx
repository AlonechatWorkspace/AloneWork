"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export interface LocaleOption {
  code: string;
  name: string;
  nativeName: string;
}

const SUPPORTED_LOCALES: LocaleOption[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "zh-Hans", name: "Chinese (Simplified)", nativeName: "简体中文" },
  { code: "zh-Hant", name: "Chinese (Traditional)", nativeName: "繁體中文" },
  { code: "ja", name: "Japanese", nativeName: "日本語" },
  { code: "ko", name: "Korean", nativeName: "한국어" },
  { code: "pt-BR", name: "Portuguese (Brazil)", nativeName: "Português (Brasil)" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "ru", name: "Russian", nativeName: "Русский" },
];

export interface LocaleSelectorProps {
  currentLocale: string;
  onLocaleChange?: (locale: string) => void;
  showNativeName?: boolean;
  compact?: boolean;
}

export function LocaleSelector({
  currentLocale,
  onLocaleChange,
  showNativeName = true,
  compact = false,
}: LocaleSelectorProps) {
  const [locale, setLocale] = useState(currentLocale);

  useEffect(() => {
    setLocale(currentLocale);
  }, [currentLocale]);

  const handleChange = (newLocale: string) => {
    setLocale(newLocale);
    onLocaleChange?.(newLocale);
  };

  if (compact) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2"
        onClick={() => {
          const currentIndex = SUPPORTED_LOCALES.findIndex(
            (l) => l.code === locale
          );
          const nextIndex = (currentIndex + 1) % SUPPORTED_LOCALES.length;
          handleChange(SUPPORTED_LOCALES[nextIndex].code);
        }}
      >
        <Globe className="h-4 w-4 mr-1" />
        {SUPPORTED_LOCALES.find((l) => l.code === locale)?.nativeName || locale}
      </Button>
    );
  }

  return (
    <Select value={locale} onValueChange={handleChange}>
      <SelectTrigger className="w-[180px]">
        <Globe className="h-4 w-4 mr-2" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SUPPORTED_LOCALES.map((loc) => (
          <SelectItem key={loc.code} value={loc.code}>
            {showNativeName ? loc.nativeName : loc.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function useTranslation(namespace?: string) {
  const [locale, setLocale] = useState("zh-Hans");
  const [translations, setTranslations] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const response = await fetch(`/api/locales/${locale}.json`);
        if (response.ok) {
          const data = await response.json();
          setTranslations(data);
        }
      } catch (error) {
        console.error("Failed to load translations:", error);
      }
    };

    loadTranslations();
  }, [locale]);

  const t = (key: string, defaultText?: string): string => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    return translations[fullKey] || defaultText || key;
  };

  return { t, locale, setLocale };
}
