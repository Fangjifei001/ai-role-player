"use client";

import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Input,
  Popconfirm,
  Select,
  Space,
  Typography,
} from "antd";
import type { Persona } from "@/lib/types/domain";

const { Text } = Typography;

export type PersonaFormProps = {
  personaDraft: Persona | null;
  onChange: (next: Persona) => void;
  filteredPersonas: Persona[];
  personaSearch: string;
  onPersonaSearchChange: (value: string) => void;
  resolvedPersonaId: string;
  onSelectPersonaId: (id: string) => void;
  onAddPersona: () => void;
  onDeletePersona: (id: string) => void;
};

export function PersonaForm({
  personaDraft,
  onChange,
  filteredPersonas,
  personaSearch,
  onPersonaSearchChange,
  resolvedPersonaId,
  onSelectPersonaId,
  onAddPersona,
  onDeletePersona,
}: PersonaFormProps) {
  return (
    <>
      {!personaDraft ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-white px-6 py-14 text-center">
          <Text type="secondary">No personas in the library yet.</Text>
          <div className="mt-5">
            <Button icon={<PlusOutlined />} type="primary" onClick={onAddPersona}>
              New Persona
            </Button>
          </div>
        </div>
      ) : (
        <div
          className="grid min-h-0 min-w-0 grid-cols-1 items-stretch gap-4 md:grid-cols-[290px_minmax(0,1fr)_290px]"
          id="persona-edit-grid"
        >
          <Card
            className="flex h-full min-h-0 flex-col"
            styles={{
              body: {
                padding: 14,
                flex: 1,
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
              },
            }}
          >
            <div className="flex min-h-0 flex-1 flex-col gap-4">
              <div className="flex shrink-0 items-center justify-between">
                <Text strong>All Personas</Text>
                <Button icon={<PlusOutlined />} onClick={onAddPersona} type="primary">
                  New Persona
                </Button>
              </div>
              <Input
                className="shrink-0"
                placeholder="Search personas..."
                value={personaSearch}
                onChange={(e) => onPersonaSearchChange(e.target.value)}
              />
              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                {filteredPersonas.map((persona) => {
                  const active = persona.id === resolvedPersonaId;
                  return (
                    <div
                      key={persona.id}
                      className={`flex items-stretch gap-0.5 rounded-xl border transition ${
                        active
                          ? "border-indigo-200 bg-indigo-50"
                          : "border-transparent bg-white hover:border-zinc-200 hover:bg-zinc-50"
                      }`}
                    >
                      <button
                        type="button"
                        className="min-w-0 flex-1 rounded-l-xl p-3 text-left"
                        onClick={() => onSelectPersonaId(persona.id)}
                      >
                        <div
                          className={`font-medium ${persona.name.trim() ? "" : "text-zinc-400"}`}
                        >
                          {persona.name.trim() || "Unnamed persona"}
                        </div>
                        <Text type="secondary" className="text-xs">
                          <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Active
                        </Text>
                      </button>
                      <Popconfirm
                        title="Delete this persona?"
                        description="Removes the persona and unchecks it from all scenarios."
                        okText="Delete"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true }}
                        onConfirm={() => onDeletePersona(persona.id)}
                      >
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          className="!mr-1 shrink-0 self-center"
                          aria-label="Delete persona"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </Popconfirm>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          <Card
            title="Basic Information"
            className="flex h-full min-h-0 flex-col"
            styles={{
              header: { flexShrink: 0 },
              body: {
                paddingTop: 20,
                paddingBottom: 20,
                flex: 1,
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
              },
            }}
          >
            <div className="flex min-h-0 flex-1 w-full flex-col gap-7">
              <div>
                <Text strong>Display Name *</Text>
                <Input
                  className="!mt-3"
                  placeholder="e.g. Skeptical CFO"
                  value={personaDraft.name}
                  onChange={(e) => onChange({ ...personaDraft, name: e.target.value })}
                />
              </div>
              <div>
                <Text strong>Behavior Notes *</Text>
                <Input.TextArea
                  className="!mt-3"
                  rows={5}
                  placeholder="How this persona thinks, pushes back, and what they care about."
                  value={personaDraft.behaviorNotes}
                  onChange={(e) => onChange({ ...personaDraft, behaviorNotes: e.target.value })}
                />
              </div>
              <div>
                <Text strong>Traits</Text>
                <Select
                  className="!mt-3 w-full"
                  mode="tags"
                  placeholder="Type a trait and press Enter"
                  value={personaDraft.traits.length ? personaDraft.traits : undefined}
                  onChange={(traits) => onChange({ ...personaDraft, traits: traits ?? [] })}
                />
              </div>
            </div>
          </Card>

          <div className="flex h-full min-h-0 min-w-0 flex-col gap-4">
            <Card
              title="Voice Behavior"
              className="flex h-full min-h-0 flex-col"
              styles={{
                header: { flexShrink: 0 },
                body: {
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 0,
                  padding: 24,
                },
              }}
            >
              <Space orientation="vertical" className="!w-full" style={{ width: "100%" }}>
                <div>
                  <Text type="secondary">Interrupt Frequency</Text>
                  <Select
                    className="mt-1 w-full"
                    value={personaDraft.voiceBehavior.interruptFrequency}
                    onChange={(interruptFrequency) =>
                      onChange({
                        ...personaDraft,
                        voiceBehavior: {
                          ...personaDraft.voiceBehavior,
                          interruptFrequency,
                        },
                      })
                    }
                    options={[
                      { label: "Low", value: "Low" },
                      { label: "Medium", value: "Medium" },
                      { label: "High", value: "High" },
                    ]}
                  />
                </div>
                <div>
                  <Text type="secondary">Speaking Pace</Text>
                  <Select
                    className="mt-1 w-full"
                    value={personaDraft.voiceBehavior.speakingPace}
                    onChange={(speakingPace) =>
                      onChange({
                        ...personaDraft,
                        voiceBehavior: { ...personaDraft.voiceBehavior, speakingPace },
                      })
                    }
                    options={[
                      { label: "Slow", value: "Slow" },
                      { label: "Moderate", value: "Moderate" },
                      { label: "Fast", value: "Fast" },
                    ]}
                  />
                </div>
                <div>
                  <Text type="secondary">Tone Style</Text>
                  <Select
                    className="mt-1 w-full"
                    value={personaDraft.voiceBehavior.toneStyle}
                    onChange={(toneStyle) =>
                      onChange({
                        ...personaDraft,
                        voiceBehavior: { ...personaDraft.voiceBehavior, toneStyle },
                      })
                    }
                    options={[
                      { label: "Friendly", value: "Friendly" },
                      { label: "Casual", value: "Casual" },
                      { label: "Formal", value: "Formal" },
                      { label: "Professional", value: "Professional" },
                      { label: "Direct", value: "Direct" },
                    ]}
                  />
                </div>
              </Space>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
