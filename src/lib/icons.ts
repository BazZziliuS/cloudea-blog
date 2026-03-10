import {
  FileText, Tags, Archive, Bot, Blocks, Gamepad2, Code, Monitor,
  BookOpen, User, ExternalLink, Globe, Heart, Star,
  FolderOpen, Home, Settings, Terminal, Database, Shield, Zap,
  Package, Coffee, Rocket, MessageCircle, Mail, Bookmark,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { GitHubIcon } from "@/components/icons";

const iconMap: Record<string, LucideIcon> = {
  "file-text": FileText,
  "tags": Tags,
  "archive": Archive,
  "bot": Bot,
  "blocks": Blocks,
  "gamepad-2": Gamepad2,
  "code": Code,
  "monitor": Monitor,
  "book-open": BookOpen,
  "user": User,
  "github": GitHubIcon as unknown as LucideIcon,
  "external-link": ExternalLink,
  "globe": Globe,
  "heart": Heart,
  "star": Star,
  "folder-open": FolderOpen,
  "home": Home,
  "settings": Settings,
  "terminal": Terminal,
  "database": Database,
  "shield": Shield,
  "zap": Zap,
  "package": Package,
  "coffee": Coffee,
  "rocket": Rocket,
  "message-circle": MessageCircle,
  "mail": Mail,
  "bookmark": Bookmark,
};

export function getIcon(name?: string): LucideIcon | null {
  if (!name) return null;
  return iconMap[name] ?? null;
}
