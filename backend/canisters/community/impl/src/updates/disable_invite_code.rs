use crate::{
    activity_notifications::handle_activity_notification, model::events::CommunityEventInternal, mutate_state,
    run_regular_jobs, RuntimeState,
};
use canister_api_macros::update;
use canister_tracing_macros::trace;
use community_canister::disable_invite_code::{Response::*, *};
use types::{GroupInviteCodeChange, GroupInviteCodeChanged, Timestamped};

#[update(msgpack = true)]
#[trace]
fn disable_invite_code(_args: Args) -> Response {
    run_regular_jobs();

    mutate_state(disable_invite_code_impl)
}

fn disable_invite_code_impl(state: &mut RuntimeState) -> Response {
    if state.data.is_frozen() {
        return CommunityFrozen;
    }

    let caller = state.env.caller();
    if let Some(member) = state.data.members.get(caller) {
        if member.suspended().value {
            return UserSuspended;
        } else if member.lapsed().value {
            return UserLapsed;
        }

        if member.role().can_invite_users(&state.data.permissions) {
            let now = state.env.now();
            state.data.invite_code_enabled = Timestamped::new(false, now);
            state.data.events.push_event(
                CommunityEventInternal::InviteCodeChanged(Box::new(GroupInviteCodeChanged {
                    change: GroupInviteCodeChange::Disabled,
                    changed_by: member.user_id,
                })),
                now,
            );

            handle_activity_notification(state);

            return Success;
        }
    }

    NotAuthorized
}
