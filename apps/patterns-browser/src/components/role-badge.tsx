/**
 * Semantic Role Badges
 *
 * Visual components for displaying semantic roles extracted from patterns.
 * Each role type has a distinct color to help users understand hyperscript syntax.
 *
 * Role Categories:
 * - Core Thematic: action, agent, patient, source, destination, goal, event, condition
 * - Quantitative: quantity, duration
 * - Adverbial: responseType, method, style
 * - Control Flow: loopType
 */

// Role descriptions for tooltips
const ROLE_DESCRIPTIONS: Record<string, string> = {
  action: 'The command/verb being executed (toggle, add, set, fetch)',
  agent: 'Who performs the action (implicitly the element)',
  patient: 'What is being acted upon (.class, #id, @attr)',
  source: 'Where something comes from (from #element)',
  destination: 'Where something goes to (to #target, into me)',
  goal: 'The purpose or outcome of the action',
  event: 'The trigger event (click, keydown, submit)',
  condition: 'A conditional expression (if, when, while)',
  quantity: 'An amount or count (by 5, 3 times)',
  duration: 'A time period (2s, 300ms)',
  responseType: 'How to interpret the response (as json, as html)',
  method: 'The HTTP method or approach (POST, GET)',
  style: 'A style or manner modifier (with fade)',
  loopType: 'Type of repetition (forever, until, for each)',
  manner: 'How the action is performed (before, after)',
};

// CSS class for each role (maps to theme.css)
const ROLE_CLASSES: Record<string, string> = {
  action: 'role-action',
  agent: 'role-agent',
  patient: 'role-patient',
  source: 'role-source',
  destination: 'role-destination',
  goal: 'role-goal',
  event: 'role-event',
  condition: 'role-condition',
  quantity: 'role-quantity',
  duration: 'role-duration',
  responseType: 'role-response',
  method: 'role-method',
  style: 'role-style',
  loopType: 'role-loop',
  manner: 'role-manner',
};

interface RoleBadgeProps {
  role: string;
  value?: string | null;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Single role badge with optional value display.
 */
export function RoleBadge({ role, value, showValue = false, size = 'md' }: RoleBadgeProps) {
  const roleClass = ROLE_CLASSES[role] || 'role-default';
  const description = ROLE_DESCRIPTIONS[role] || role;
  const sizeClass = size === 'sm' ? 'role-badge-sm' : size === 'lg' ? 'role-badge-lg' : '';

  return (
    <span class={`role-badge ${roleClass} ${sizeClass}`} title={description}>
      <span class="role-name">{role}</span>
      {showValue && value && (
        <span class="role-value">{value}</span>
      )}
    </span>
  );
}

interface PatternRole {
  role: string;
  roleValue: string | null;
  roleType: string | null;
  commandIndex: number;
  required: boolean;
}

interface RoleListProps {
  roles: PatternRole[];
  showValues?: boolean;
  groupByCommand?: boolean;
}

/**
 * Display a list of semantic roles for a pattern.
 */
export function RoleList({ roles, showValues = true, groupByCommand = true }: RoleListProps) {
  if (roles.length === 0) {
    return <p class="muted">No semantic roles extracted</p>;
  }

  if (groupByCommand) {
    // Group roles by command index
    const grouped = new Map<number, PatternRole[]>();
    for (const role of roles) {
      const existing = grouped.get(role.commandIndex) || [];
      existing.push(role);
      grouped.set(role.commandIndex, existing);
    }

    // Sort by command index
    const sortedGroups = Array.from(grouped.entries()).sort((a, b) => a[0] - b[0]);

    return (
      <div class="role-groups">
        {sortedGroups.map(([_cmdIndex, cmdRoles]) => {
          // Find the action for this command
          const actionRole = cmdRoles.find(r => r.role === 'action');
          const otherRoles = cmdRoles.filter(r => r.role !== 'action');

          return (
            <div class="role-group">
              {actionRole && (
                <div class="role-command">
                  <RoleBadge
                    role="action"
                    value={actionRole.roleValue}
                    showValue={true}
                    size="md"
                  />
                </div>
              )}
              <div class="role-args">
                {otherRoles.map(role => (
                  <RoleBadge
                    role={role.role}
                    value={role.roleValue}
                    showValue={showValues}
                    size="sm"
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Flat list (no grouping)
  return (
    <div class="role-list">
      {roles.map(role => (
        <RoleBadge
          role={role.role}
          value={role.roleValue}
          showValue={showValues}
        />
      ))}
    </div>
  );
}

/**
 * Compact role summary showing just role types.
 */
export function RoleSummary({ roles }: { roles: PatternRole[] }) {
  // Get unique role types (excluding action since it's always present)
  const uniqueRoles = new Set(roles.map(r => r.role).filter(r => r !== 'action'));

  return (
    <div class="role-summary">
      {Array.from(uniqueRoles).map(role => (
        <RoleBadge role={role} size="sm" />
      ))}
    </div>
  );
}

/**
 * Interactive role filter badge.
 */
export function RoleFilterBadge({
  role,
  count,
  active = false,
}: {
  role: string;
  count: number;
  active?: boolean;
}) {
  const roleClass = ROLE_CLASSES[role] || 'role-default';
  const activeClass = active ? 'active' : '';

  return (
    <a
      href={`/patterns?role=${role}`}
      class={`role-filter-badge ${roleClass} ${activeClass}`}
      _={`on click
          halt the event
          fetch '/patterns/list?role=${role}' as html
          morph #pattern-list with it using view transition
          push url '/patterns?role=${role}'
          remove .active from .role-filter-badge
          add .active to me
        end`}
    >
      <span class="role-name">{role}</span>
      <span class="role-count">{count}</span>
    </a>
  );
}
