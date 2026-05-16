export enum DeviceCommand {
  SetPhase = "set_phase",
  SetMode = "set_mode",
  ManualRun = "manual_run",
  Stop = "stop",
  Reboot = "reboot",
}
export type SetPhaseCommand = {
  cmd: DeviceCommand.SetPhase;
  params: {
    phase: "germination" | "nursery";
  };
};

export type SetModeCommand = {
  cmd: DeviceCommand.SetMode;
  params: {
    mode: "auto" | "manual";
  };
};

export type ManualRunCommand = {
  cmd: DeviceCommand.ManualRun;
  params: {
    light?: number;
    fan?: number;
    mist?: number;
  };
};

export type StopCommand = {
  cmd: DeviceCommand.Stop;
};

export type RebootCommand = {
  cmd: DeviceCommand.Reboot;
};

export type OnCommandProp =
  | SetPhaseCommand
  | SetModeCommand
  | ManualRunCommand
  | StopCommand
  | RebootCommand;
