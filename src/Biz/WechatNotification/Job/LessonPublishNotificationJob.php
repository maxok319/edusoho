<?php

namespace Biz\WeChatNotification\Job;

use AppBundle\Common\ArrayToolkit;

class LessonPublishNotificationJob extends AbstractNotificationJob
{
    public function execute()
    {
        $key = $this->args['key'];
        $templateId = $this->getWeChatService()->getTemplateId($key);
        if (empty($templateId)) {
            return;
        }

        try {
            $taskId = $this->args['taskId'];
            $url = $this->args['url'];
            $task = $this->getTaskService()->getTask($taskId);
            if ('published' != $task['status']) {
                return;
            }

            $course = $this->getCourseService()->getCourse($task['courseId']);
            $courseSet = $this->getCourseSetService()->getCourseSet($course['courseSetId']);
            if ('published' != $courseSet['status'] || 'published' != $course['status']) {
                return;
            }

            $conditions = array('courseId' => $course['id'], 'role' => 'student');
            $members = $this->getCourseMemberService()->searchMembers($conditions, array(), 0, PHP_INT_MAX, array('userId'));
            if (empty($members)) {
                return;
            }

            $teachers = $this->getCourseMemberService()->searchMembers(
                array('courseId' => $course['id'], 'role' => 'teacher', 'isVisible' => 1),
                array('id' => 'asc'),
                0,
                1
            );
            $teacher = $this->getUserService()->getUser($teachers[0]['userId']);

            $userIds = ArrayToolkit::column($members, 'userId');
            $data = array(
                'first' => array('value' => '同学，你好，课程有新任务发布'),
                'keyword1' => array('value' => $courseSet['title']),
                'keyword2' => array('value' => ('live' == $task['type']) ? '直播课' : ''),
                'keyword3' => array('value' => $teacher['nickname']),
                'keyword4' => array('value' => ('live' == $task['type']) ? date('Y-m-d H:i', $task['startTime']) : date('Y-m-d H:i', $task['updatedTime'])),
                'remark' => array('value' => ('live' == $task['type']) ? '请准时参加' : '请及时前往学习'),
            );
            $options = array('url' => $url);
            $this->sendNotifications($userIds, $templateId, $data, $options);
        } catch (\Exception $e) {
            $this->getLogService()->error(AppLoggerConstant::NOTIFY, 'wechat_notify_lesson_publish', "发送微信通知失败:template:{$key}", array('error' => $e->getMessage()));
        }
    }
}