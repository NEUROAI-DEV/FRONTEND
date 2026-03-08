import SpaceDashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";
import SpaceDashboardIcon from "@mui/icons-material/SpaceDashboard";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import PersonIcon from "@mui/icons-material/Person";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import CollectionsOutlinedIcon from "@mui/icons-material/CollectionsOutlined";
import NewspaperOutlinedIcon from "@mui/icons-material/NewspaperOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import SchoolIcon from "@mui/icons-material/School";
import TokenOutlinedIcon from "@mui/icons-material/TokenOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import QueryStatsOutlinedIcon from "@mui/icons-material/QueryStatsOutlined";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import PollIcon from "@mui/icons-material/Poll";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import ArticleIcon from "@mui/icons-material/Article";
import CandlestickChartOutlinedIcon from "@mui/icons-material/CandlestickChartOutlined";
import CandlestickChartIcon from "@mui/icons-material/CandlestickChart";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import BarChartIcon from "@mui/icons-material/BarChart";

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
  screener: { outline: BarChartOutlinedIcon, fill: BarChartIcon },
  news: { outline: ArticleOutlinedIcon, fill: ArticleIcon },
  academy: { outline: SchoolOutlinedIcon, fill: SchoolIcon },
  profile: { outline: PersonOutlineOutlinedIcon, fill: PersonIcon },
  smartMoney: { outline: MonetizationOnOutlinedIcon, fill: MonetizationOnIcon },
  livePredict: {
    outline: CandlestickChartOutlinedIcon,
    fill: CandlestickChartIcon,
  },
};
