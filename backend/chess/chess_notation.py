class NotationCreator:
    def __init__(self, piece_symbol, new_position, is_move_ambiguous,
                 ambiguous_move_identifier, did_capture_in_last_move,
                 castle_type, promote_to, is_checked, is_checkmated):
        self.piece_symbol = piece_symbol
        self.new_position = new_position
        self.is_move_ambiguous = is_move_ambiguous
        self.ambiguous_move_identifier = ambiguous_move_identifier
        self.did_capture_in_last_move = did_capture_in_last_move
        self.castle_type = castle_type
        self.promote_to = promote_to
        self.is_checked = is_checked
        self.is_checkmated = is_checkmated

    def get_notation(self):
        if self.castle_type:
            return self.castle_move_notation()
        elif self.promote_to:
            return self.promoting_move_notation()
        elif self.is_checked:
            return self.check_move_notation()
        elif self.is_checkmated:
            return self.checkmate_move_notation()
        elif self.did_capture_in_last_move:
            return self.capturing_move_notation()
        else:
            return self.regular_move_notation()

    def regular_move_notation(self):
        if self.is_move_ambiguous:
            return self.piece_symbol + self.ambiguous_move_identifier + self.new_position
        return self.piece_symbol + self.new_position

    def capturing_move_notation(self):
        if self.is_move_ambiguous:
            return self.piece_symbol + self.ambiguous_move_identifier + "x" + self.new_position
        return self.piece_symbol + "x" + self.new_position

    def promoting_move_notation(self):
        if self.did_capture_in_last_move:
            base_str = self.capturing_move_notation() + "=" + self.promote_to
        else:
            base_str = self.regular_move_notation() + "=" + self.promote_to

        if self.is_checked:
            return base_str + "+"
        elif self.is_checkmated:
            return base_str + "#"
        return base_str

    def check_move_notation(self):
        if self.did_capture_in_last_move:
            return self.capturing_move_notation() + "+"
        return self.regular_move_notation() + "+"

    def checkmate_move_notation(self):
        if self.did_capture_in_last_move:
            return self.capturing_move_notation() + "#"
        return self.regular_move_notation() + "#"

    def castle_move_notation(self):
        if self.castle_type.split("_")[1] == "short":
            return "O-O"
        elif self.castle_type.split("_")[1] == "long":
            return "O-O-O"

    def en_passant_notation(self):
        pass
