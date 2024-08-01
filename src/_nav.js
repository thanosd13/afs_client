import React from "react";
import CIcon from "@coreui/icons-react";
import { cilPeople, cilChartPie, cilUser } from "@coreui/icons";
import { CNavItem } from "@coreui/react";

const _nav = [
  {
    component: CNavItem,
    name: "Έσοδα-Έξοδα",
    to: "/charts",
    icon: <CIcon icon={cilChartPie} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: "Χρήστες",
    to: "/users",
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: "Ο λογαριασμός μου",
    to: "/my_account",
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },
];

const _navUser = [
  {
    component: CNavItem,
    name: "Έσοδα-Έξοδα",
    to: "/charts",
    icon: <CIcon icon={cilChartPie} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: "Ο λογαριασμός μου",
    to: "/my_account",
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },
];

export { _nav, _navUser };
