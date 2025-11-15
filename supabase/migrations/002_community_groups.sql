-- Migration: Community Groups
-- Description: Add tables for community groups functionality
-- Date: 2025-11-15

-- ============================================================================
-- 1. Groups Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  description VARCHAR(500) NOT NULL,
  language_id VARCHAR(20) NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_groups_language ON groups(language_id);
CREATE INDEX idx_groups_owner ON groups(owner_id);
CREATE INDEX idx_groups_created ON groups(created_at DESC);

COMMENT ON TABLE groups IS 'Stores learning groups created by users';
COMMENT ON COLUMN groups.name IS 'Group name (3-50 characters)';
COMMENT ON COLUMN groups.description IS 'Group description (10-500 characters)';
COMMENT ON COLUMN groups.language_id IS 'Programming language: python, javascript, typescript, java, cpp, csharp, go';
COMMENT ON COLUMN groups.member_count IS 'Denormalized count of members for performance';

-- ============================================================================
-- 2. Group Members Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

CREATE INDEX idx_group_members_group ON group_members(group_id);
CREATE INDEX idx_group_members_user ON group_members(user_id);
CREATE INDEX idx_group_members_online ON group_members(is_online) WHERE is_online = true;

COMMENT ON TABLE group_members IS 'Stores group membership relationships';
COMMENT ON COLUMN group_members.is_online IS 'Current online status of member';
COMMENT ON COLUMN group_members.last_seen IS 'Last activity timestamp';

-- ============================================================================
-- 3. Group Messages Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS group_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content VARCHAR(1000) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_group_messages_group ON group_messages(group_id);
CREATE INDEX idx_group_messages_created ON group_messages(created_at DESC);
CREATE INDEX idx_group_messages_user ON group_messages(user_id);

COMMENT ON TABLE group_messages IS 'Stores messages in group chats';
COMMENT ON COLUMN group_messages.content IS 'Message content (1-1000 characters)';

-- ============================================================================
-- 4. Triggers for Auto-Update
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_groups_updated_at 
BEFORE UPDATE ON groups
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update member count when member joins
CREATE OR REPLACE FUNCTION increment_member_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE groups 
  SET member_count = member_count + 1 
  WHERE id = NEW.group_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_group_member_count
AFTER INSERT ON group_members
FOR EACH ROW EXECUTE FUNCTION increment_member_count();

-- Update member count when member leaves
CREATE OR REPLACE FUNCTION decrement_member_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE groups 
  SET member_count = member_count - 1 
  WHERE id = OLD.group_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER decrement_group_member_count
AFTER DELETE ON group_members
FOR EACH ROW EXECUTE FUNCTION decrement_member_count();

-- Transfer ownership when owner leaves
CREATE OR REPLACE FUNCTION transfer_group_ownership()
RETURNS TRIGGER AS $$
DECLARE
  new_owner_id UUID;
BEGIN
  -- Check if the leaving member is the owner
  IF EXISTS (SELECT 1 FROM groups WHERE id = OLD.group_id AND owner_id = OLD.user_id) THEN
    -- Find the next oldest member to become owner
    SELECT user_id INTO new_owner_id
    FROM group_members
    WHERE group_id = OLD.group_id 
      AND user_id != OLD.user_id
    ORDER BY joined_at ASC
    LIMIT 1;
    
    -- If there's another member, transfer ownership
    IF new_owner_id IS NOT NULL THEN
      UPDATE groups 
      SET owner_id = new_owner_id 
      WHERE id = OLD.group_id;
    END IF;
    -- If no other members, the group will be deleted by CASCADE
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transfer_ownership_on_leave
BEFORE DELETE ON group_members
FOR EACH ROW EXECUTE FUNCTION transfer_group_ownership();

-- ============================================================================
-- 5. Row Level Security (RLS)
-- ============================================================================

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;

-- Groups Policies
CREATE POLICY "Groups are viewable by everyone" ON groups
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create groups" ON groups
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Only owner can update group" ON groups
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Only owner can delete group" ON groups
  FOR DELETE USING (auth.uid() = owner_id);

-- Group Members Policies
CREATE POLICY "Group members are viewable by everyone" ON group_members
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can join groups" ON group_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups" ON group_members
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can update own member status" ON group_members
  FOR UPDATE USING (auth.uid() = user_id);

-- Group Messages Policies
CREATE POLICY "Only members can read messages" ON group_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = group_messages.group_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Only members can send messages" ON group_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = group_messages.group_id
      AND user_id = auth.uid()
    )
  );

-- ============================================================================
-- 6. Helper Functions
-- ============================================================================

-- Function to check if user can create more groups (max 3)
CREATE OR REPLACE FUNCTION can_create_group(user_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  group_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO group_count
  FROM groups
  WHERE owner_id = user_id_param;
  
  RETURN group_count < 3;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION can_create_group IS 'Checks if user can create more groups (max 3)';

-- Function to check if user can join more groups (max 10)
CREATE OR REPLACE FUNCTION can_join_group(user_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  membership_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO membership_count
  FROM group_members
  WHERE user_id = user_id_param;
  
  RETURN membership_count < 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION can_join_group IS 'Checks if user can join more groups (max 10)';

-- Function to get groups with membership info for a user
CREATE OR REPLACE FUNCTION get_groups_with_membership(user_id_param UUID)
RETURNS TABLE (
  id UUID,
  name VARCHAR(50),
  description VARCHAR(500),
  language_id VARCHAR(20),
  owner_id UUID,
  member_count INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  is_member BOOLEAN,
  is_owner BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    g.id,
    g.name,
    g.description,
    g.language_id,
    g.owner_id,
    g.member_count,
    g.created_at,
    g.updated_at,
    EXISTS (
      SELECT 1 FROM group_members gm 
      WHERE gm.group_id = g.id AND gm.user_id = user_id_param
    ) as is_member,
    g.owner_id = user_id_param as is_owner
  FROM groups g
  ORDER BY g.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_groups_with_membership IS 'Returns all groups with membership status for a user';

-- Function to clean up empty groups (no members)
CREATE OR REPLACE FUNCTION cleanup_empty_groups()
RETURNS void AS $$
BEGIN
  DELETE FROM groups
  WHERE member_count = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_empty_groups IS 'Removes groups with no members';

-- ============================================================================
-- Migration Complete
-- ============================================================================
