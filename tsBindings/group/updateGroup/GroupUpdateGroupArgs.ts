// This file was generated by [ts-rs](https://github.com/Aleph-Alpha/ts-rs). Do not edit this file manually.
import type { OptionUpdateAccessGateConfig } from "../../shared/OptionUpdateAccessGateConfig";
import type { OptionUpdateDocument } from "../../shared/OptionUpdateDocument";
import type { OptionUpdateU64 } from "../../shared/OptionUpdateU64";
import type { OptionalGroupPermissions } from "../../shared/OptionalGroupPermissions";
import type { UpdatedRules } from "../../shared/UpdatedRules";

export type GroupUpdateGroupArgs = { name?: string, description?: string, rules?: UpdatedRules, avatar: OptionUpdateDocument, permissions_v2?: OptionalGroupPermissions, events_ttl: OptionUpdateU64, gate_config: OptionUpdateAccessGateConfig, public?: boolean, messages_visible_to_non_members?: boolean, correlation_id: bigint, };
