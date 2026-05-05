"use client";

import { DownloadOutlined } from "@ant-design/icons";
import { App, Button } from "antd";

export type FeedbackExportButtonsProps = {
  /** Plain-text transcript copied to the clipboard when Export is clicked. */
  transcript: string;
};

/** Single primary export control — matches the original feedback header (red theme). */
export function FeedbackExportButtons({ transcript }: FeedbackExportButtonsProps) {
  const { message } = App.useApp();
  const canExport = transcript.trim().length > 0;

  const handleExport = async () => {
    if (!canExport) return;
    try {
      await navigator.clipboard.writeText(transcript);
      message.success("Transcript copied to clipboard.");
    } catch {
      message.error("Could not copy to clipboard.");
    }
  };

  return (
    <Button
      type="primary"
      icon={<DownloadOutlined />}
      disabled={!canExport}
      onClick={() => void handleExport()}
    >
      Export Report
    </Button>
  );
}
