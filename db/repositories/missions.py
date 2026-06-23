from db.connection import get_db_cursor


class MissionRepository:
    """Data-access layer cho bảng missions."""

    @staticmethod
    def get_all_active():
        """Lấy tất cả mission đang active, sắp xếp theo sort_order."""
        with get_db_cursor() as cur:
            cur.execute(
                'SELECT * FROM missions WHERE is_active = TRUE ORDER BY sort_order'
            )
            return cur.fetchall()

    @staticmethod
    def get_by_course(course_id):
        """Lấy mission theo course_id (có thể nhiều mission / khóa học)."""
        with get_db_cursor() as cur:
            cur.execute(
                'SELECT * FROM missions WHERE course_id = %s AND is_active = TRUE ORDER BY sort_order',
                (course_id,)
            )
            return cur.fetchall()

    @staticmethod
    def get_by_id(mission_id):
        """Lấy mission theo primary key."""
        with get_db_cursor() as cur:
            cur.execute('SELECT * FROM missions WHERE id = %s', (mission_id,))
            return cur.fetchone()

    @staticmethod
    def verify_answer_by_course(course_id, condition, action):
        """Kiểm tra đáp án qua course_id (backward-compatible với frontend).

        Frontend hiện gửi mission_id = course_id (string), nên dùng method này
        thay vì verify_answer() để không cần sửa JS.
        Trả về mission row nếu đúng, None nếu sai.
        """
        with get_db_cursor() as cur:
            cur.execute(
                '''SELECT * FROM missions
                   WHERE course_id = %s
                     AND correct_condition = %s
                     AND correct_action    = %s
                     AND is_active = TRUE
                   LIMIT 1''',
                (course_id, condition, action)
            )
            return cur.fetchone()

    @staticmethod
    def verify_answer(mission_id, condition, action):
        """Kiểm tra đáp án qua PK integer.

        Dùng khi frontend đã cập nhật để gửi mission id thực sự.
        Trả về mission row nếu đúng, None nếu sai.
        """
        with get_db_cursor() as cur:
            cur.execute(
                '''SELECT * FROM missions
                   WHERE id = %s
                     AND correct_condition = %s
                     AND correct_action    = %s
                     AND is_active = TRUE''',
                (mission_id, condition, action)
            )
            return cur.fetchone()
