import SpaceDashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";
import SpaceDashboardIcon from "@mui/icons-material/SpaceDashboard";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import PersonIcon from "@mui/icons-material/Person";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import CollectionsOutlinedIcon from "@mui/icons-material/CollectionsOutlined";
import NewspaperOutlinedIcon from "@mui/icons-material/NewspaperOutlined";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import SchoolIcon from "@mui/icons-material/School";
import TokenOutlinedIcon from "@mui/icons-material/TokenOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import QueryStatsOutlinedIcon from "@mui/icons-material/QueryStatsOutlined";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import PollIcon from "@mui/icons-material/Poll";

export const IconMenus = {
  dashboard: SpaceDashboardOutlinedIcon,
  token: TokenOutlinedIcon,
  news: NewspaperOutlinedIcon,
  academy: SchoolOutlinedIcon,
  notification: NotificationsActiveOutlinedIcon,
  trend: TimelineOutlinedIcon,
  admin: AdminPanelSettingsOutlinedIcon,
  profile: PersonOutlineOutlinedIcon,
  settings: SettingsOutlinedIcon,
  support: SupportAgentOutlinedIcon,
  upload: CollectionsOutlinedIcon,
  screener: QueryStatsOutlinedIcon,
  watchList: BookmarkIcon,
  summary: PollIcon,
};

/** Sidebar: active = outline, inactive = fill */
export const IconMenusSidebar = {
  dashboard: { outline: SpaceDashboardOutlinedIcon, fill: SpaceDashboardIcon },
  watchList: { outline: BookmarkBorderIcon, fill: BookmarkIcon },
  screener: { outline: QueryStatsOutlinedIcon, fill: QueryStatsIcon },
  news: { outline: NewspaperOutlinedIcon, fill: NewspaperIcon },
  academy: { outline: SchoolOutlinedIcon, fill: SchoolIcon },
  profile: { outline: PersonOutlineOutlinedIcon, fill: PersonIcon },
};
