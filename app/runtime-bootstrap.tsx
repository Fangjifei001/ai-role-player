"use client";

import { useEffect } from "react";
import { initializeAdminRuntimeData } from "@/lib/runtime/store";

export default function RuntimeBootstrap() {
  useEffect(() => {
    initializeAdminRuntimeData();
  }, []);

  return null;
}
