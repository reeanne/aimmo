class Avatar(object):
    def handle_turn(self, world_state, events):
        from simulation.action import MoveAction
        from simulation import direction

        self.location = world_state.my_avatar.location
        directions = (direction.EAST, direction.SOUTH, direction.WEST, direction.NORTH)
        direction_of_other_avatar = next((d for d in directions if world_state.map_centred_at_me.is_on_map(self.location + d) and world_state.map_centred_at_me.get_cell(self.location + d).avatar), None)
        if direction_of_other_avatar:
            from simulation.action import AttackAction
            return AttackAction(direction_of_other_avatar)
        import random
        direction_to_other_player = self.direction_to(next(a.location for a in world_state.avatar_manager.avatars if a != world_state.my_avatar))
        if direction_to_other_player:
            return MoveAction(random.choice(directions + ((direction_to_other_player,) * 10)))
        return MoveAction(random.choice(directions))

    def direction_to(self, location):
        from simulation import direction

        vector_to = location - self.location
        if vector_to.x != 0:
            return direction.Direction(1 if vector_to.x > 0 else -1, 0)
        if vector_to.y != 0:
            return direction.Direction(0, 1 if vector_to.y > 0 else -1)
        return None
