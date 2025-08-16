import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer, View } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { useAppStore } from '../store/useAppStore';
import { Task } from '../../../shared/types';
import { TaskEditor } from '../components/TaskEditor';

// 配置moment使用24小时制
moment.locale('zh-cn', {
  longDateFormat: {
    LT: 'HH:mm',
    LTS: 'HH:mm:ss',
    L: 'YYYY-MM-DD',
    LL: 'YYYY年MM月DD日',
    LLL: 'YYYY年MM月DD日 HH:mm',
    LLLL: 'dddd, YYYY年MM月DD日 HH:mm'
  }
});

const localizer = momentLocalizer(moment);
const DragAndDropCalendar = withDragAndDrop(Calendar);

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: Task;
}

interface CalendarViewProps {
  onEditTask?: (task: Task) => void;
  view?: View;
  date?: Date;
  onNavigate?: (date: Date) => void;
  onView?: (view: View) => void;
}

// 使用本地时间格式化日期，避免时区偏移问题
const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const CalendarView: React.FC<CalendarViewProps> = ({ 
  onEditTask, 
  view = 'month', 
  date = new Date(), 
  onNavigate, 
  onView 
}) => {
  const { tasks, lists, setTasks, setLists, setLoading, loading } = useAppStore();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [initialTaskData, setInitialTaskData] = useState<Partial<Task> | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  // 颜色模式状态：'priority' 表示根据优先级显示，'list' 表示根据清单颜色显示
  // 从localStorage读取保存的颜色模式，默认为'priority'
  const [colorMode, setColorMode] = useState<'priority' | 'list'>(() => {
    const saved = localStorage.getItem('calendar-color-mode');
    return (saved === 'list' || saved === 'priority') ? saved : 'priority';
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // 加载清单
      if (window.electronAPI) {
        const listsResult = await window.electronAPI.lists.getAll();
        if (listsResult.ok && listsResult.data) {
          setLists(listsResult.data);
        }
        
        // 加载任务
        const tasksResult = await window.electronAPI.tasks.query({});
        if (tasksResult.ok && tasksResult.data) {
          setTasks(tasksResult.data);
        }
      } else {
        // 浏览器环境下的模拟数据
        setLists([{ id: 1, name: '默认清单', color: '#3174ad', sort_order: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }]);
        setTasks([]);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 将任务转换为日历事件
    const calendarEvents: CalendarEvent[] = tasks
      .filter((task: Task) => task.date)
      .map((task: Task) => {
        const taskDate = new Date(task.date);
        let startTime = new Date(taskDate);
        let endTime = new Date(taskDate.getTime() + 60 * 60 * 1000); // 默认1小时时长
        
        // 处理开始时间
        if (task.start_time) {
          if (task.start_time.includes('T')) {
            // 完整的ISO日期时间字符串
            startTime = new Date(task.start_time);
          } else {
            // 只有时间部分，需要与日期组合
            const [hours, minutes] = task.start_time.split(':').map(Number);
            startTime = new Date(taskDate);
            startTime.setHours(hours, minutes, 0, 0);
          }
        }
        
        // 处理结束时间
        if (task.end_time) {
          if (task.end_time.includes('T')) {
            // 完整的ISO日期时间字符串
            endTime = new Date(task.end_time);
          } else {
            // 只有时间部分，需要与日期组合
            const [hours, minutes] = task.end_time.split(':').map(Number);
            endTime = new Date(taskDate);
            endTime.setHours(hours, minutes, 0, 0);
          }
        } else if (task.start_time && !task.start_time.includes('T')) {
          // 如果只有开始时间且是时间格式，结束时间默认为开始时间+1小时
          endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
        }
        
        return {
          id: task.id,
          title: task.title,
          start: startTime,
          end: endTime,
          resource: task
        };
      });
    
    setEvents(calendarEvents);
  }, [tasks]);

  const handleSelectEvent = (event: any) => {
    if (!window.electronAPI) {
      alert('此应用必须在 Electron 环境中运行才能编辑任务');
      return;
    }
    
    setSelectedTask(event.resource);
    if (onEditTask) {
      onEditTask(event.resource);
    } else {
      setIsEditorOpen(true);
    }
  };

  const handleSelectSlot = ({ start, end }: { start: Date; end?: Date }) => {
    if (!window.electronAPI) {
      alert('此应用必须在 Electron 环境中运行才能创建任务');
      return;
    }
    
    // 如果没有结束时间，默认设置为开始时间后1小时
    const endTime = end || new Date(start.getTime() + 60 * 60 * 1000);
    
    const newTask: Partial<Task> = {
      title: '',
      date: formatLocalDate(start),
      start_time: start.toTimeString().split(' ')[0].substring(0, 5), // HH:MM格式
      end_time: endTime.toTimeString().split(' ')[0].substring(0, 5), // HH:MM格式
      priority: 'medium',
      status: 'pending',
      list_id: lists.length > 0 ? lists[0].id : null,
      notes: ''
    };
    // 设置初始数据并打开编辑器
    setSelectedTask(null);
    setInitialTaskData(newTask);
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setSelectedTask(null);
    setInitialTaskData(null);
  };

  // 处理事件拖拽移动
  const handleEventDrop = async (args: any) => {
    const { event, start, end } = args;
    if (!window.electronAPI) {
      alert('此应用必须在 Electron 环境中运行才能移动任务');
      return;
    }

    try {
      const updatedTask = {
        ...event.resource,
        date: formatLocalDate(start),
        start_time: start.toTimeString().split(' ')[0].substring(0, 5), // HH:MM格式
        end_time: end.toTimeString().split(' ')[0].substring(0, 5) // HH:MM格式
      };

      const result = await window.electronAPI.tasks.update(updatedTask.id, updatedTask);
      if (result.ok) {
        // 重新加载数据
        loadData();
      } else {
        alert('更新任务失败');
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      alert('更新任务时发生错误');
    }
  };

  // 处理事件调整大小
  const handleEventResize = async (args: any) => {
    const { event, start, end } = args;
    if (!window.electronAPI) {
      alert('此应用必须在 Electron 环境中运行才能调整任务时间');
      return;
    }

    try {
      const updatedTask = {
        ...event.resource,
        start_time: start.toTimeString().split(' ')[0].substring(0, 5), // HH:MM格式
        end_time: end.toTimeString().split(' ')[0].substring(0, 5) // HH:MM格式
      };

      const result = await window.electronAPI.tasks.update(updatedTask.id, updatedTask);
      if (result.ok) {
        // 重新加载数据
        loadData();
      } else {
        alert('更新任务失败');
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      alert('更新任务时发生错误');
    }
  };

  const eventStyleGetter = (event: any) => {
    const task = event.resource;
    let backgroundColor = '#3174ad';
    
    if (colorMode === 'priority') {
      // 根据任务优先级和状态设置颜色
      if (task.status === 'completed') {
        backgroundColor = '#10b981'; // 绿色
      } else if (task.status === 'in_progress') {
        backgroundColor = '#f59e0b'; // 橙色
      } else if (task.priority === 'high') {
        backgroundColor = '#ef4444'; // 红色
      } else if (task.priority === 'medium') {
        backgroundColor = '#f59e0b'; // 橙色
      } else if (task.priority === 'low') {
        backgroundColor = '#6b7280'; // 灰色
      }
    } else if (colorMode === 'list') {
      // 根据清单颜色设置颜色
      const taskList = lists.find(list => list.id === task.list_id);
      if (taskList && taskList.color) {
        backgroundColor = taskList.color;
      } else {
        backgroundColor = '#6b7280'; // 默认灰色（收件箱或未找到清单）
      }
      
      // 已完成任务降低透明度
      if (task.status === 'completed') {
        backgroundColor = backgroundColor + '80'; // 添加透明度
      }
    }
    
    return {
      style: {
        backgroundColor,
        borderRadius: '3px',
        opacity: task.status === 'completed' && colorMode === 'priority' ? 0.6 : 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  // 自定义日期格子样式，确保所有日期都有统一的背景色
  const dayPropGetter = (date: Date) => {
    return {
      style: {
        backgroundColor: 'white', // 统一设置为白色背景
        color: '#374151' // 深灰色文字
      }
    };
  };



  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6">
      {/* 颜色模式切换控件 */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">时间块颜色：</span>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => {
                setColorMode('priority');
                localStorage.setItem('calendar-color-mode', 'priority');
              }}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                colorMode === 'priority'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              按优先级
            </button>
            <button
              onClick={() => {
                setColorMode('list');
                localStorage.setItem('calendar-color-mode', 'list');
              }}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                colorMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              按清单颜色
            </button>
          </div>
        </div>
        
        {/* 颜色说明 */}
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          {colorMode === 'priority' ? (
            <>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>高优先级</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span>中优先级</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-gray-500 rounded"></div>
                <span>低优先级</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>已完成</span>
              </div>
            </>
          ) : (
            <span>时间块颜色对应各清单设置的颜色</span>
          )}
        </div>
      </div>
      
      <div className="flex-1 bg-white rounded-lg shadow p-4 overflow-hidden">
        <DragAndDropCalendar
          localizer={localizer}
          events={events}
          startAccessor={(event: any) => event.start}
          endAccessor={(event: any) => event.end}
          style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}
          view={view}
          views={['month', 'week', 'day']}
          date={date}
          onView={onView}
            onNavigate={onNavigate}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          eventPropGetter={eventStyleGetter}
          dayPropGetter={dayPropGetter}
          scrollToTime={new Date(1970, 1, 1, 8)}
          min={new Date(1970, 1, 1, 0, 0, 0)}
          max={new Date(1970, 1, 1, 23, 59, 59)}
          step={30}
          timeslots={2}
          onEventDrop={handleEventDrop}
          onEventResize={handleEventResize}
          messages={{
            next: '下一个',
            previous: '上一个',
            today: '今天',
            month: '月',
            week: '周',
            day: '日',
            date: '日期',
            time: '时间',
            event: '事件',
            noEventsInRange: '此时间范围内没有事件',
            showMore: (total) => `+${total} 更多`
          }}
        />
      </div>

      {isEditorOpen && (
        <TaskEditor
          isOpen={isEditorOpen}
          task={selectedTask}
          initialData={initialTaskData || undefined}
          onClose={() => {
            handleCloseEditor();
            loadData(); // 重新加载任务
          }}
        />
      )}
    </div>
  );
};