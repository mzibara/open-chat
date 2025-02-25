import type {
    CommunityMap,
    CommunitySummary,
    LocalCommunitySummaryUpdates,
    MemberRole,
} from "openchat-shared";
import { hasOwnerRights, isPermitted } from "./permissions";

export function canChangeRoles(
    { membership, permissions }: CommunitySummary,
    currRole: MemberRole,
    newRole: MemberRole,
): boolean {
    if (currRole === newRole) {
        return false;
    }

    switch (newRole) {
        case "owner":
            return hasOwnerRights(membership.role);
        default:
            return isPermitted(membership.role, permissions.changeRoles);
    }
}

export function canEditCommunity({ membership, permissions }: CommunitySummary): boolean {
    return isPermitted(membership.role, permissions.updateDetails);
}

export function canCreatePublicChannel({ membership, permissions }: CommunitySummary): boolean {
    return isPermitted(membership.role, permissions.createPublicChannel);
}

export function canCreatePrivateChannel({ membership, permissions }: CommunitySummary): boolean {
    return isPermitted(membership.role, permissions.createPrivateChannel);
}

export function canManageUserGroups({ membership, permissions }: CommunitySummary): boolean {
    return isPermitted(membership.role, permissions.manageUserGroups);
}

export function canChangeCommunityRoles({ membership, permissions }: CommunitySummary): boolean {
    return isPermitted(membership.role, permissions.changeRoles);
}

export function canChangeCommunityPermissions({ membership }: CommunitySummary): boolean {
    return hasOwnerRights(membership.role);
}

export function isCommunityLapsed({ membership }: CommunitySummary): boolean {
    return membership.lapsed;
}

export function canDeleteCommunity({ membership }: CommunitySummary): boolean {
    return hasOwnerRights(membership.role);
}

export function canBlockUsers(community: CommunitySummary): boolean {
    return (
        community.public &&
        isPermitted(community.membership.role, community.permissions.removeMembers)
    );
}

export function canUnblockUsers(community: CommunitySummary): boolean {
    return (
        community.public &&
        isPermitted(community.membership.role, community.permissions.removeMembers)
    );
}

export function canInviteUsers(community: CommunitySummary): boolean {
    return isPermitted(community.membership.role, community.permissions.inviteUsers);
}

export function canRemoveMembers(community: CommunitySummary): boolean {
    return isPermitted(community.membership.role, community.permissions.removeMembers);
}

export function mergeLocalUpdates(
    server: CommunityMap<CommunitySummary>,
    localUpdates: CommunityMap<LocalCommunitySummaryUpdates>,
): CommunityMap<CommunitySummary> {
    if (Object.keys(localUpdates).length === 0) return server;

    const merged = server.clone();

    for (const [chatId, localUpdate] of localUpdates.entries()) {
        if (localUpdate.added !== undefined) {
            const current = merged.get(chatId);
            if (
                current === undefined ||
                current.membership.role === "none" ||
                current.membership.lapsed
            ) {
                merged.set(chatId, localUpdate.added);
            }
        }
        if (localUpdate.removedAtTimestamp) {
            const community = merged.get(chatId);
            if (
                community !== undefined &&
                community.membership.joined < localUpdate.removedAtTimestamp
            ) {
                merged.delete(chatId);
            }
        }
        if (localUpdate.index !== undefined) {
            const community = merged.get(chatId);
            if (community !== undefined) {
                merged.set(chatId, {
                    ...community,
                    membership: {
                        ...community.membership,
                        index: localUpdate.index,
                    },
                });
            }
        }
        if (localUpdate.displayName !== undefined) {
            const community = merged.get(chatId);
            if (community !== undefined) {
                merged.set(chatId, {
                    ...community,
                    membership: {
                        ...community.membership,
                        displayName:
                            localUpdate.displayName !== "set_to_none"
                                ? localUpdate.displayName.value
                                : undefined,
                    },
                });
            }
        }
        if (localUpdate.rulesAccepted !== undefined) {
            const community = merged.get(chatId);
            if (community !== undefined) {
                merged.set(chatId, {
                    ...community,
                    membership: {
                        ...community.membership,
                        rulesAccepted: localUpdate.rulesAccepted,
                    },
                });
            }
        }
    }

    return merged;
}
