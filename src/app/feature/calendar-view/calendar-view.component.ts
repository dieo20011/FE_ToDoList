import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  CalendarRespone,
  IDayListData,
  ToDoStatus,
  ToDoList,
} from './calendar-view.interface';
import moment from 'moment';
import { CalendarViewApiService } from './calendar-view.service';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { TodoAddTaskComponent } from './todo-add-task/todo-add-task.component';
import { PopUpConfirmComponent } from '../../../shared/ui/pop-up-confirm/pop-up-confirm.component';
import { TokenDecodeService } from '../../../core/service/token.service';
import { AuthApiService } from '../../../core/service/auth.service';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzTableModule } from 'ng-zorro-antd/table';
import { ReadMoreComponent } from "../../../shared/ui/read-more/read-more.component";
import { HolidayService } from '../holiday/holiday.service';
import { IHoliday } from '../holiday/holiday.interface';
@Component({
  selector: 'app-calendar-view',
  imports: [
    CommonModule,
    NzButtonModule,
    NzModalModule,
    NzSelectModule,
    ReactiveFormsModule,
    NzFormModule,
    FormsModule,
    NzTableModule,
    ReadMoreComponent
],
  providers: [CalendarViewApiService, HolidayService],
  templateUrl: './calendar-view.component.html',
  styleUrl: './calendar-view.component.scss',
})
export class CalendarViewComponent implements OnInit {
  dataSource: CalendarRespone[] = [];
  tokenDetails: any;
  currentDate: Date = new Date();
  weeks: string[] = [
    'Thứ hai',
    'Thứ ba',
    'Thứ tư',
    'Thứ năm',
    'Thứ sáu',
    'Thứ bảy',
    'Chủ nhật',
  ];
  days: IDayListData[] = [];
  viewCalendarType = 3;
  monthTitle: string = '';
  weekTitle: string = '';
  viewDataType: number = 1;
  isViewDataTypeCalendar = false;
  today = new Date();
  ToDoStatus = ToDoStatus;
  toDoStatusList = ToDoList;
  holidayData: IHoliday[] = [];
  viewLeaveTypeList = [
    {
      value: 0,
      label: 'Xem thông tin dạng bảng',
    },
    {
      value: 1,
      label: 'Xem thông tin dạng lịch',
    },
  ];
  statusToDo: number = 0;
  ToDoStatusList = [
    { value: 3, label: 'Tất cả' },
    { value: 0, label: 'Chưa làm' },
    { value: 1, label: 'Đang tiến hành' },
    { value: 2, label: 'Hoàn thành' },
  ];
  constructor(
    private readonly _calendarSvc: CalendarViewApiService,
    private readonly _holidaySvc: HolidayService,
    private readonly _notification: NzNotificationService,
    private readonly _authSvc: AuthApiService,
    private readonly _tokenSvc: TokenDecodeService,
    private readonly _nzModalSvc: NzModalService
  ) {}
  ngOnInit(): void {
    this.generateCalendar(this.today);
    this.getAllToDoListData();
  }

  getAllToDoListData() {
    this.tokenDetails = this._tokenSvc.getTokenDetails(
      this._authSvc.getToken()
    );
    if (this.tokenDetails?.userId) {
      this._calendarSvc
        .getAllToDoListData(this.tokenDetails?.userId, this.statusToDo)
        .subscribe((resp) => {
          if (resp.status) {
            this.dataSource = resp.data;
          }
        });
      this._calendarSvc.getHolidayData(this.tokenDetails?.userId).subscribe((resp) => {
        if (resp.status) {
          this.holidayData = resp.data.items;
        }
      });
    }
  }

  adjustWeekdayIndex(weekday: number): number {
    return (weekday + 6) % 7;
  }
  generateCalendar(currentDate: Date) {
    const months = [
      'Tháng 1',
      'Tháng 2',
      'Tháng 3',
      'Tháng 4',
      'Tháng 5',
      'Tháng 6',
      'Tháng 7',
      'Tháng 8',
      'Tháng 9',
      'Tháng 10',
      'Tháng 11',
      'Tháng 12',
    ];

    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const lastDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );
    const daysInMonth = lastDayOfMonth.getDate();

    this.days = [];

    // Get the weekday index of the first day of the month
    const firstDayWeekIndex = this.adjustWeekdayIndex(firstDayOfMonth.getDay());

    // Add days from the previous month
    for (let i = firstDayWeekIndex; i > 0; i--) {
      const day = new Date(firstDayOfMonth);
      day.setDate(day.getDate() - i);
      this.days.push({ date: day, isOtherMonth: true });
    }

    // Add days in the current month
    for (let i = 1; i <= daysInMonth; i++) {
      const day = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        i
      );
      this.days.push({ date: day, isOtherMonth: false });
    }

    // Add days from next month
    const remainingDays = 7 - (this.days.length % 7);
    for (let i = 1; i <= remainingDays; i++) {
      const day = new Date(lastDayOfMonth);
      day.setDate(day.getDate() + i);
      this.days.push({ date: day, isOtherMonth: true });
    }

    // Update monthTitle
    const monthName = months[currentDate.getMonth()];
    this.monthTitle = `${monthName} ${currentDate.getFullYear()}`;
    // Update week number
    const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
    const daysBetween = Math.floor(
      (currentDate.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)
    );
    const weekNumber = Math.ceil((daysBetween + 1) / 7);
    this.weekTitle = `Tuần ${weekNumber}`;
    //
    const fromDate = new Date(this.days[0].date);
    const endDate = new Date(this.days[this.days.length - 1].date);
    // this.gridFilter.get('fromDate')?.setValue(fromDate);
    // this.gridFilter.get('toDate')?.setValue(endDate);
    // this.search();
  }
  //Change Type both 'Week' and 'Month'
  changeDate(action: 'increase' | 'decrease') {
    if (this.viewCalendarType === 2) {
      this.changeWeek(action);
    } else if (this.viewCalendarType === 3) {
      this.changeMonth(action);
    }
  }
  //View calendar with Type = 'Week'
  changeWeek(action: 'increase' | 'decrease') {
    const newDate = new Date(this.currentDate);
    if (action === 'increase') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    this.currentDate = newDate;
    this.generateCalendar(this.currentDate);
  }

  //View calendar with Type = 'Month'
  changeMonth(action: 'increase' | 'decrease') {
    const newDate = new Date(this.currentDate);
    if (action === 'increase') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    this.currentDate = newDate;
    this.days = [];
    this.generateCalendar(this.currentDate);
  }

  editToDoTask(event: CalendarRespone) {
    console.log(event);
  }

  getEventsForDay(date: Date): any {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    const dayOfMonth = normalizedDate.getDate();
    const month = normalizedDate.getMonth();
    const dayOfWeek = this.adjustWeekdayIndex(normalizedDate.getDay());

    const year = normalizedDate.getFullYear(); // lấy năm hiện tại


    const holiday = this.holidayData.find(holiday => {
      const holidayDate = new Date(holiday.fromDate);
      holidayDate.setHours(0, 0, 0, 0);

      const holidayDayOfMonth = holidayDate.getDate();
      const holidayMonth = holidayDate.getMonth();
      const holidayYear = holidayDate.getFullYear();

      if (holiday.isAnnualHoliday) {
        // Nếu holiday.isHolidayByYear là true, hiển thị sự kiện này vào ngày lễ bất kể năm nào
        return holidayDayOfMonth === dayOfMonth && holidayMonth === month;
      } else {
        // Nếu holiday.isHolidayByYear là false, chỉ hiển thị nếu năm của sự kiện trùng với năm hiện tại
        return holidayDayOfMonth === dayOfMonth && holidayMonth === month && holidayYear === year;
      }
    });

    // Nếu tìm thấy ngày lễ
    if (holiday) {
      // Kiểm tra xem ngày lễ có trùng vào cuối tuần không
      if (dayOfWeek === 6 || dayOfWeek === 5) {
        return [
          {
            title: 'Cuối tuần',
            fromDate: normalizedDate.toISOString(),
            toDate: normalizedDate.toISOString(),
            avatar: '',
            isHoliday: true,
          },
        ];
      } else {
        // Nếu không phải cuối tuần, hiển thị tên ngày lễ
        return [
          {
            title: holiday.name,
            fromDate: normalizedDate.toISOString(),
            toDate: normalizedDate.toISOString(),
            avatar: '',
            isHoliday: true,
          },
        ];
      }
    }

    // Kiểm tra cuối tuần (nếu không có holiday)
    if (dayOfWeek === 6 || dayOfWeek === 5) {
      return [
        {
          title: 'Cuối tuần',
          fromDate: normalizedDate.toISOString(),
          toDate: normalizedDate.toISOString(),
          avatar: '',
          isHoliday: true,
        },
      ];
    }
    // Nếu không có holiday hoặc cuối tuần, trả về các sự kiện từ dataSource
    return this.dataSource.filter((event) => {
      const eventFromDate = new Date(event.fromDate);
      const eventToDate = new Date(event.toDate);

      const localFromDate = new Date(
        eventFromDate.getTime() + eventFromDate.getTimezoneOffset() * 60000
      );
      const localToDate = new Date(
        eventToDate.getTime() + eventToDate.getTimezoneOffset() * 60000
      );

      return localFromDate <= normalizedDate && localToDate >= normalizedDate;
    });
  }

  // Get Week by currentDate
  getWeekDays(date: Date) {
    const startOfWeek = moment(date).startOf('isoWeek').toDate();
    const endOfWeek = moment(date).endOf('isoWeek').toDate();

    return this.days.filter((day) => {
      return day.date >= startOfWeek && day.date <= endOfWeek;
    });
  }

  changeViewDataType(event: any) {
    console.log(event);
    this.viewDataType = event;
    localStorage.setItem('viewDataTypeSelfLeave', this.viewDataType.toString());
    if (this.viewDataType === 0) {
      this.isViewDataTypeCalendar = false;
      this.viewCalendarType = 3;
      // this.gridFilter.get('fromDate')?.patchValue('');
      // this.gridFilter.get('toDate')?.patchValue('');
    } else {
      this.isViewDataTypeCalendar = true;
      this.generateCalendar(this.today);
    }
  }

  getDataFromLocalStorage() {
    const storedViewDataType = localStorage.getItem('viewDataTypeSelfLeave');
    if (storedViewDataType) {
      this.viewDataType = parseInt(storedViewDataType);
      if (this.viewDataType === 0) {
        this.isViewDataTypeCalendar = false;
      } else {
        this.isViewDataTypeCalendar = true;
        this.generateCalendar(this.today);
      }
    }
  }

  openAddTask() {
    const modalRef = this._nzModalSvc.create({
      nzContent: TodoAddTaskComponent,
      nzWidth: 700,
      nzData: { userId: this.tokenDetails?.userId },
      nzMaskClosable: false,
      nzFooter: null,
    });
    modalRef.afterClose.subscribe((reload: boolean) => {
      if (!reload) return;
      this._notification.success('Tạo task thành công', '');
      this.getAllToDoListData();
    });
  }

  openEditTask(data: CalendarRespone) {
    const modalRef = this._nzModalSvc.create({
      nzContent: TodoAddTaskComponent,
      nzWidth: 700,
      nzData: { data: data, userId: this.tokenDetails?.userId },
      nzMaskClosable: false,
      nzFooter: null,
    });
    modalRef.afterClose.subscribe((reload: boolean) => {
      if (!reload) return;
      this._notification.success('Sửa task thành công', '');
      this.getAllToDoListData();
    });
  }

  deleteTask(id: string, event: Event) {
    event.stopPropagation();
    const modalRef = this._nzModalSvc.create({
      nzContent: PopUpConfirmComponent,
      nzWidth: 320,
      nzData: { title: `Bạn có chắc chắn muốn xóa?` },
      nzFooter: null,
    });
    modalRef.componentInstance!.clickSubmit.subscribe(() => {
      this._calendarSvc.deleteTask(Number(id)).subscribe((resp) => {
        if (resp.status) {
          modalRef.destroy();
          this._notification.success('Xóa task thành công', '');
          this.getAllToDoListData();
        }
      });
    });
  }

  public getStatusTask(number: ToDoStatus) {
    return this.toDoStatusList.find((item) => item.value === number)?.label;
  }

  public click(event: Event) {
    event.stopPropagation();
  }
}
